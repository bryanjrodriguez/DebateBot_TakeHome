
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id text PRIMARY KEY,
    topic text NOT NULL,
    stance text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id text NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'bot')),
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

--ik it's overkill just for showing ik what indexs are 
CREATE INDEX IF NOT EXISTS idx_conversation_id ON chat_messages(conversation_id);
ALTER TABLE chat_messages 
    ADD CONSTRAINT fk_conversation 
    FOREIGN KEY (conversation_id) 
    REFERENCES conversations(conversation_id)
    ON DELETE CASCADE; 