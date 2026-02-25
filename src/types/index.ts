export interface Message {
    id: string;
    role: 'user' | 'daimon';
    text: string;
    timestamp: string;
}
