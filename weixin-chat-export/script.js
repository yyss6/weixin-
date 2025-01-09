// 常用表情列表
const commonEmojis = ['😊', '😂', '🤣', '❤️', '😍', '🤔', '👍', '😭', '😘', '🙏', '😅', '😉', '🤗', '😐', '😶', '😏', '👌', '🎉'];

// 状态变量
let myAvatar = null;
let otherAvatar = null;

// 初始化时更新时间
function updateTime() {
    const timeInput = document.getElementById('status-time');
    const timeDisplay = document.querySelector('.status-bar .time');
    timeDisplay.textContent = timeInput.value;
}

// 更新联系人名称
function updateContactName() {
    const name = document.getElementById('contact-name').value;
    document.querySelector('.chat-header .contact-name').textContent = name;
}

// 更新电池电量
function updateBattery() {
    const level = document.getElementById('battery-level').value;
    const batteryLevel = document.querySelector('.battery-level');
    batteryLevel.style.width = `${level}%`;
}

// 更新网络状态
function updateNetwork() {
    const networkType = document.getElementById('network-type').value;
    document.querySelector('.network-type').textContent = networkType;
}

// 切换主题
function toggleTheme() {
    const theme = document.getElementById('theme-mode').value;
    document.documentElement.setAttribute('data-theme', theme);
}

// 处理头像上传
function handleAvatarUpload(event, isMyAvatar) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            const previewId = isMyAvatar ? 'my-avatar-preview' : 'other-avatar-preview';
            const preview = document.getElementById(previewId);
            preview.innerHTML = '';
            preview.appendChild(img);
            
            if (isMyAvatar) {
                myAvatar = e.target.result;
            } else {
                otherAvatar = e.target.result;
            }
            
            // 更新现有消息的头像
            updateMessageAvatars();
        };
        reader.readAsDataURL(file);
    }
}

// 更新所有消息的头像
function updateMessageAvatars() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        const avatar = message.querySelector('.avatar');
        if (avatar) {
            const img = document.createElement('img');
            img.src = message.classList.contains('sent') ? myAvatar : otherAvatar;
            avatar.innerHTML = '';
            avatar.appendChild(img);
        }
    });
}

// 创建新消息
function createMessage(content, isSent = true, type = 'text') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    // 添加时间
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time';
    const now = new Date();
    timeDiv.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if ((isSent && myAvatar) || (!isSent && otherAvatar)) {
        const img = document.createElement('img');
        img.src = isSent ? myAvatar : otherAvatar;
        avatar.appendChild(img);
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (type === 'text' || type === 'emoji') {
        messageContent.textContent = content;
    } else if (type === 'image') {
        messageContent.className += ' image';
        const img = document.createElement('img');
        img.src = content;
        messageContent.appendChild(img);
    } else if (type === 'system') {
        messageDiv.className = 'message system';
        messageContent.textContent = content;
    }
    
    messageDiv.appendChild(timeDiv);
    if (type !== 'system') {
        messageDiv.appendChild(avatar);
    }
    messageDiv.appendChild(messageContent);
    
    return messageDiv;
}

// 添加消息到预览区域
function addMessageToPreview(content, isSent, type = 'text') {
    const chatContainer = document.getElementById('chat-preview');
    const message = createMessage(content, isSent, type);
    chatContainer.appendChild(message);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 处理文本消息添加
function handleAddText() {
    const content = prompt('请输入消息内容：');
    if (content) {
        const isSent = confirm('这是发送的消息吗？（确定=发送的消息，取消=接收的消息）');
        addMessageToPreview(content, isSent, 'text');
    }
}

// 处理图片消息添加
function handleAddImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const isSent = confirm('这是发送的图片吗？（确定=发送的图片，取消=接收的图片）');
                addMessageToPreview(e.target.result, isSent, 'image');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// 处理系统消息添加
function handleAddSystem() {
    const content = prompt('请输入系统消息内容：');
    if (content) {
        addMessageToPreview(content, true, 'system');
    }
}

// 初始化表情选择器
function initEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    const container = picker.querySelector('.emoji-container');
    
    commonEmojis.forEach(emoji => {
        const div = document.createElement('div');
        div.className = 'emoji-item';
        div.textContent = emoji;
        div.onclick = () => {
            const isSent = confirm('这是发送的表情吗？（确定=发送的表情，取消=接收的表情）');
            addMessageToPreview(emoji, isSent, 'emoji');
            picker.classList.remove('active');
        };
        container.appendChild(div);
    });
}

// 处理表情选择器显示
function handleAddEmoji() {
    const picker = document.getElementById('emoji-picker');
    picker.classList.toggle('active');
}

// 导出图片
async function exportImage() {
    const quality = parseFloat(document.getElementById('export-quality').value);
    const container = document.getElementById('phone-container');
    
    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: null
        });
        
        const link = document.createElement('a');
        link.download = '微信聊天记录.png';
        link.href = canvas.toDataURL('image/png', quality);
        link.click();
    } catch (error) {
        console.error('导出图片失败:', error);
        alert('导出图片失败，请重试');
    }
}

// 处理消息输入
function handleMessageInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        
        if (content) {
            addMessageToPreview(content, true, 'text');
            input.value = '';
        }
    }
}

// 处理语音按钮点击
function handleVoiceClick() {
    addMessageToPreview('[语音]', true, 'text');
}

// 处理加号按钮点击
function handlePlusClick() {
    const panel = document.getElementById('plus-panel');
    panel.classList.toggle('active');
    
    // 点击其他地方关闭面板
    document.addEventListener('click', function closePanel(e) {
        if (!panel.contains(e.target) && !e.target.closest('.plus-btn')) {
            panel.classList.remove('active');
            document.removeEventListener('click', closePanel);
        }
    });
}

// 处理发送图片
function handleSendImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addMessageToPreview(e.target.result, true, 'image');
                document.getElementById('plus-panel').classList.remove('active');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// 处理发送文件
function handleSendFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const fileMessage = `[文件] ${file.name}`;
            addMessageToPreview(fileMessage, true, 'text');
            document.getElementById('plus-panel').classList.remove('active');
        }
    };
    input.click();
}

// 初始化
function init() {
    // 更新时间
    updateTime();
    setInterval(updateTime, 60000); // 每分钟更新一次时间
    
    // 初始化表情选择器
    initEmojiPicker();
    
    // 绑定事件监听器
    document.getElementById('contact-name').addEventListener('input', updateContactName);
    document.getElementById('status-time').addEventListener('input', updateTime);
    document.getElementById('battery-level').addEventListener('input', updateBattery);
    document.getElementById('network-type').addEventListener('change', updateNetwork);
    document.getElementById('theme-mode').addEventListener('change', toggleTheme);
    
    document.getElementById('my-avatar').addEventListener('change', e => handleAvatarUpload(e, true));
    document.getElementById('other-avatar').addEventListener('change', e => handleAvatarUpload(e, false));
    
    document.getElementById('add-text').addEventListener('click', handleAddText);
    document.getElementById('add-image').addEventListener('click', handleAddImage);
    document.getElementById('add-emoji').addEventListener('click', handleAddEmoji);
    document.getElementById('add-system').addEventListener('click', handleAddSystem);
    document.getElementById('export-image').addEventListener('click', exportImage);
    
    // 添加输入框相关的事件监听器
    document.getElementById('message-input').addEventListener('keypress', handleMessageInput);
    document.querySelector('.voice-btn').addEventListener('click', handleVoiceClick);
    document.querySelector('.plus-btn').addEventListener('click', handlePlusClick);
    
    // 添加加号面板功能的事件监听器
    document.getElementById('send-image').addEventListener('click', handleSendImage);
    document.getElementById('send-file').addEventListener('click', handleSendFile);
    
    // 添加示例消息
    addMessageToPreview('你好！', false);
    addMessageToPreview('你好啊！', true);
    
    // 初始化状态
    updateBattery();
    updateNetwork();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 