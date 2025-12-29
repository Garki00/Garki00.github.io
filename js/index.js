document.addEventListener('DOMContentLoaded', function() {
    
    createBubbles();
    
    
    const avatar = document.querySelector('.avatar');
    avatar.addEventListener('click', function() {
        this.style.transform = 'scale(1.1) rotate(5deg)';
        setTimeout(() => {
            this.style.transform = 'scale(1.05)';
        }, 300);
    });
});


function createBubbles() {
    const bubblesContainer = document.getElementById('bubbles');
    const bubbleCount = 15; // 小球数量
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        
        const size = Math.random() * 40 + 20;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
       
        const opacity = Math.random() * 0.2 + 0.1;
        bubble.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        
        
        const floatDuration = Math.random() * 10 + 10;
        const floatDistance = Math.random() * 20 + 10;
        bubble.style.animation = `float ${floatDuration}s ease-in-out infinite alternate`;
        
        
        bubblesContainer.appendChild(bubble);
        
        
        setupBubbleInteraction(bubble);
    }
    
    
    addFloatAnimation();
}


function addFloatAnimation() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes float {
            0% { transform: translateY(0) translateX(0); }
            100% { transform: translateY(-20px) translateX(10px); }
        }
    `;
    document.head.appendChild(styleSheet);
}


function setupBubbleInteraction(bubble) {
    let isMoving = false;
    let originalX = 0;
    let originalY = 0;
    
    
    const rect = bubble.getBoundingClientRect();
    originalX = parseFloat(bubble.style.left) || 0;
    originalY = parseFloat(bubble.style.top) || 0;
    
    bubble.addEventListener('mouseenter', function(e) {
        if (isMoving) return;
        isMoving = true;
        
        
        bubble.style.animationPlayState = 'paused';
        
        
        const bubbleRect = bubble.getBoundingClientRect();
        const bubbleCenterX = bubbleRect.left + bubbleRect.width / 2;
        const bubbleCenterY = bubbleRect.top + bubbleRect.height / 2;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        
        const dx = bubbleCenterX - mouseX;
        const dy = bubbleCenterY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        
        if (distance < 100) {
            
            const angle = Math.atan2(dy, dx);
            const force = 120 - distance; // 距离越近，力量越大
            const moveX = Math.cos(angle) * force;
            const moveY = Math.sin(angle) * force;
            
            
            const moveXPercent = (moveX / window.innerWidth) * 100;
            const moveYPercent = (moveY / window.innerHeight) * 100;
            
            
            bubble.style.left = `${originalX + moveXPercent}%`;
            bubble.style.top = `${originalY + moveYPercent}%`;
            bubble.style.opacity = '0.7';
            bubble.style.transition = 'all 0.4s ease-out';
        }
        
       
        setTimeout(() => {
            bubble.style.left = `${originalX}%`;
            bubble.style.top = `${originalY}%`;
            bubble.style.opacity = '1';
            
            // 1秒后恢复动画
            setTimeout(() => {
                bubble.style.animationPlayState = 'running';
                isMoving = false;
            }, 1000);
        }, 2000);
    });
}


window.addEventListener('load', function() {
    const card = document.querySelector('.card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 300);
});
