import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Member } from '../types';

export default function useProfileInfo() {
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

  const getAvatar = (userObj: Member) => {
    if (!userObj) {
      return null;
    }
    if (userObj.profilePicture?._url) {
      return userObj.profilePicture._url;
    }
    return `https://cdn.discordapp.com/avatars/${userObj.discordId}/${userObj.avatar}.png`;
  };

  return {
    avatar,
    getAvatar,
  };
}
