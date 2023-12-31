import { useEffect, useState } from 'react';

import { onValue, ref } from 'firebase/database';
import { database } from '../services/firebase';

import { useAuth } from './useAuth';

type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  },
  content: string;
  isHighlighted: boolean;
  isAnswered: boolean;
  likeCount: number;
  likeId: string | undefined;
};

type FirebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  },
  content: string;
  isHighlighted: boolean;
  isAnswered: boolean;
  likes: Record<string, {
    authorId: string;
  }>;
}>;

export function useRoom(roomId: string) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const unsubscribe = onValue(ref(database, `rooms/${roomId}`), room => {
      const databaseRoom = room.val();
      const firebaseQuestions = databaseRoom.questions as FirebaseQuestions ?? {};
      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0]
        };
      });

      setTitle(databaseRoom.title);
      setQuestions(parsedQuestions);
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, user?.id]);

  return { questions, title };
}