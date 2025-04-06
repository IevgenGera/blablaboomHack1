import time
import random
import json
from typing import Dict, List, Optional

class Message:
    def __init__(self, message_id: int, content: str, expiry_time: int, 
                 peek_price: float, blast_price: float):
        self.id = message_id
        self.content = content
        self.encrypted_content = self._encrypt(content)
        self.expiry_time = expiry_time  # Unix timestamp when message will boom
        self.peek_price = peek_price
        self.blast_price = blast_price
        self.is_destroyed = False
        self.peek_count = 0
        self.blast_count = 0
        
    def _encrypt(self, text: str) -> str:
        """Simple mock encryption for demo purposes"""
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?~`-=[]\\;',./"
        return ''.join(random.choice(chars) for _ in range(len(text) * 2))
    
    def time_remaining(self) -> int:
        """Returns seconds until boom"""
        now = int(time.time())
        return max(0, self.expiry_time - now)
    
    def peek(self) -> Optional[str]:
        """Allow temporary viewing of content"""
        if self.is_destroyed:
            return None
        
        self.peek_count += 1
        return self.content
    
    def blast(self) -> Optional[str]:
        """Make content public"""
        if self.is_destroyed:
            return None
        
        self.blast_count += 1
        return self.content
    
    def check_expiry(self) -> bool:
        """Check if message should boom"""
        if self.time_remaining() <= 0 and not self.is_destroyed:
            self.is_destroyed = True
            return True
        return False
    
    def to_dict(self, include_content: bool = False) -> Dict:
        """Convert to dictionary for API responses"""
        result = {
            "id": self.id,
            "encrypted_content": self.encrypted_content,
            "time_remaining": self.time_remaining(),
            "peek_price": self.peek_price,
            "blast_price": self.blast_price,
            "is_destroyed": self.is_destroyed,
            "peek_count": self.peek_count,
            "blast_count": self.blast_count
        }
        
        if include_content and not self.is_destroyed:
            result["content"] = self.content
            
        return result


class MessageService:
    def __init__(self):
        self.messages: Dict[int, Message] = {}
        self.next_id = 1
        self.stats = {
            "total_messages": 0,
            "active_messages": 0,
            "destroyed_messages": 0,
            "total_peeks": 0,
            "total_blasts": 0,
            "total_sol_earned": 0.0
        }
    
    def create_message(self, content: str, lifetime_seconds: int, 
                      peek_price: float, blast_price: float) -> int:
        """Create a new message"""
        message_id = self.next_id
        self.next_id += 1
        
        expiry_time = int(time.time()) + lifetime_seconds
        
        message = Message(
            message_id=message_id,
            content=content,
            expiry_time=expiry_time,
            peek_price=peek_price,
            blast_price=blast_price
        )
        
        self.messages[message_id] = message
        self.stats["total_messages"] += 1
        self.stats["active_messages"] += 1
        
        return message_id
    
    def get_message(self, message_id: int) -> Optional[Dict]:
        """Get message details"""
        message = self.messages.get(message_id)
        if not message:
            return None
        
        # Check if message should boom
        if message.check_expiry():
            self.stats["active_messages"] -= 1
            self.stats["destroyed_messages"] += 1
        
        return message.to_dict()
    
    def peek_message(self, message_id: int) -> Optional[Dict]:
        """Peek at a message (temporary view)"""
        message = self.messages.get(message_id)
        if not message:
            return None
        
        # Check if message should boom
        if message.check_expiry():
            self.stats["active_messages"] -= 1
            self.stats["destroyed_messages"] += 1
            return message.to_dict()
        
        content = message.peek()
        if content:
            self.stats["total_peeks"] += 1
            self.stats["total_sol_earned"] += message.peek_price
            
        return message.to_dict(include_content=True)
    
    def blast_message(self, message_id: int) -> Optional[Dict]:
        """Blast a message (make public)"""
        message = self.messages.get(message_id)
        if not message:
            return None
        
        # Check if message should boom
        if message.check_expiry():
            self.stats["active_messages"] -= 1
            self.stats["destroyed_messages"] += 1
            return message.to_dict()
        
        content = message.blast()
        if content:
            self.stats["total_blasts"] += 1
            self.stats["total_sol_earned"] += message.blast_price
            
        return message.to_dict(include_content=True)
    
    def get_active_messages(self, limit: int = 20) -> List[Dict]:
        """Get a list of active messages"""
        active_messages = []
        
        for message in self.messages.values():
            # Check if message should boom
            if message.check_expiry():
                self.stats["active_messages"] -= 1
                self.stats["destroyed_messages"] += 1
                continue
                
            if not message.is_destroyed:
                active_messages.append(message.to_dict())
                
            if len(active_messages) >= limit:
                break
                
        return active_messages
    
    def get_stats(self) -> Dict:
        """Get system statistics"""
        return self.stats


# Example usage
if __name__ == "__main__":
    service = MessageService()
    
    # Create some test messages
    message_id1 = service.create_message(
        "This is a secret message that will self-destruct", 
        300,  # 5 minutes
        0.1,   # 0.1 SOL to peek
        1.0    # 1.0 SOL to blast
    )
    
    message_id2 = service.create_message(
        "Another secret that nobody should see", 
        60,   # 1 minute
        0.2,   # 0.2 SOL to peek
        2.0    # 2.0 SOL to blast
    )
    
    # Get message details
    print(f"Message 1: {json.dumps(service.get_message(message_id1), indent=2)}")
    
    # Peek at message
    print(f"Peeking at message 1: {json.dumps(service.peek_message(message_id1), indent=2)}")
    
    # Blast message
    print(f"Blasting message 2: {json.dumps(service.blast_message(message_id2), indent=2)}")
    
    # Get stats
    print(f"System stats: {json.dumps(service.get_stats(), indent=2)}")
    
    # Get active messages
    print(f"Active messages: {json.dumps(service.get_active_messages(), indent=2)}")

