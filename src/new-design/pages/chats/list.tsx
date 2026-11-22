import type { Role } from '../../api/types';
import { Messenger } from './messenger';

/** Список диалогов. */
export function ChatsList({ role }: { role: Extract<Role, 'student' | 'tutor'> }) {
  return <Messenger role={role} />;
}

export default function StudentChatsPage() {
  return <ChatsList role="student" />;
}
