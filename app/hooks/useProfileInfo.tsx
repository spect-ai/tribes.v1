import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Member, Profile } from '../types';

export default function useProfileInfo() {
  const { user, isAuthenticated } = useMoralis();
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      setAvatar(
        user?.attributes.profilePicture
          ? user.attributes.profilePicture._url
          : `https://cdn.discordapp.com/avatars/${user?.get('discordId')}/${
              user?.attributes.avatar
            }.png`
      );
    }
  }, [
    isAuthenticated,
    user?.attributes.profilePicture,
    user?.attributes.avatar,
  ]);

  const getAvatar = (userObj: Member | Profile) => {
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
