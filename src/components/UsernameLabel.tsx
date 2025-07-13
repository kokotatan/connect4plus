import React from 'react';

type UsernameLabelProps = {
  user1: string;
  user2: string;
};

export const UsernameLabel: React.FC<UsernameLabelProps> = ({ user1, user2 }) => (
  <div className="w-64 h-16 relative rounded-[5px] border border-purple-500 overflow-hidden">
    <div className="w-28 h-7 left-[22px] top-[17px] absolute">
      <div className="w-28 h-7 left-0 top-0 absolute justify-center text-black text-2xl font-semibold font-['Noto_Sans'] leading-[50px]">
        {user1}
      </div>
    </div>
    <div className="w-28 h-7 left-[121px] top-[17px] absolute">
      <div className="w-28 h-7 left-0 top-0 absolute text-right justify-center text-black text-2xl font-semibold font-['Noto_Sans'] leading-[50px]">
        {user2}
      </div>
    </div>
  </div>
);

export default UsernameLabel; 