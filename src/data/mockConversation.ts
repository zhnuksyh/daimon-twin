import type { Message } from '../types';

// --- MOCK DATA FOR PROTOTYPE ---
// This currently holds static conversational data.
// IN THE FUTURE: This will be replaced by a fetch call to Supabase to load
// the user's previous chat history upon session initialization.
export const MOCK_CONVERSATION: Message[] = [
    {
        id: '1',
        role: 'user',
        text: "I'm feeling stuck with my ML studies today, it's exhausting to digest all these concepts. Sometimes I wonder if my cognitive function can bear it.",
        timestamp: '10:42 AM'
    },
    {
        id: '2',
        role: 'daimon',
        text: "Haha, I know the feeling perfectly. It's like the cognitive function just hits a wall when wrestling with quantization or embeddings. Remember what we wrote back in December—sometimes you just need rest so the brain can adapt. We are building the architecture for something bigger, that little brother figure, that comfortable future. Take a breath, step away from the IDE, and let the concepts settle. We're on the right path.",
        timestamp: '10:43 AM'
    }
];
