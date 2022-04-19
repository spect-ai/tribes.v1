import { AnyPtrRecord } from 'dns';
import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Member } from '../types';

type Props = {};

export const useProfileInfo = () => {
  const { user, isAuthenticated } = useMoralis();
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      setAvatar(
        user?.get('profilePicture')
          ? user.get('profilePicture')._url
          : `https://cdn.discordapp.com/avatars/${user?.get(
              'discordId'
            )}/${user?.get('avatar')}.png`
      );
    }
  }, [isAuthenticated, user]);

  const getAvatar = (user: Member) => {
    if (!user) {
      return;
    }
    if (user.profilePicture?._url) {
      return user.profilePicture._url;
    } else {
      return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`;
    }
  };

  return {
    avatar,
    getAvatar,
  };
};
