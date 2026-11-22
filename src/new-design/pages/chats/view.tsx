import type { Role } from '../../api/types';
import { Messenger } from './messenger';

/** Диалог открывается по собственному адресу. */
export function ChatView({ role }: { role: Extract<Role, 'student' | 'tutor'> }) {
  return <Messenger role={role} />;
}

export default function StudentChatPage() {
  return <ChatView role="student" />;
}
