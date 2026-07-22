'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/auth';

export function ProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  
  // Available color choices for the avatar
  const colors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
  ];
  
  const avatarImages = [
    '/avatars/avatar_1_1784439300343.png',
    '/avatars/avatar_2_1784439312430.png',
    '/avatars/avatar_3_1784439324465.png',
    '/avatars/avatar_4_1784439342654.png',
    '/avatars/avatar_5_1784439355039.png',
    '/avatars/avatar_6_1784439367868.png',
    '/avatars/avatar_7_1784439385170.png',
    '/avatars/avatar_8_1784439397694.png',
    '/avatars/avatar_9_1784439409906.png',
    '/avatars/avatar_10_1784439421671.png',
  ];

  const [avatarColor, setAvatarColor] = useState(user.avatarColor || colors[0].value);
  const [avatarImage, setAvatarImage] = useState<string | null>(user.avatarImage || null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      avatarColor,
      avatarImage: avatarImage === null ? undefined : avatarImage,
    };
    
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // If password changed, they might need to log in again, 
      // but session is ID-based so it should still be valid.
      router.refresh(); // Refresh server components (AppHeader etc)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-green-500/10 text-green-600 border border-green-500/20'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-ink block">Name</label>
        <input 
          id="name"
          name="name"
          type="text" 
          defaultValue={user.name}
          required
          className="w-full px-4 py-3 bg-paper border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent [transition:border-color_var(--dur-micro)_ease,box-shadow_var(--dur-micro)_ease]"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink block">Email</label>
        <input 
          id="email"
          name="email"
          type="email" 
          defaultValue={user.email}
          required
          className="w-full px-4 py-3 bg-paper border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent [transition:border-color_var(--dur-micro)_ease,box-shadow_var(--dur-micro)_ease]"
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-ink block">Avatar</label>
        
        <div>
          <p className="text-xs text-ink-500 mb-2 font-medium uppercase tracking-wider">Cartoon Avatars</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x scrollbar-thin">
            <button
              type="button"
              onClick={() => setAvatarImage(null)}
              className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg bg-ink-800 text-ink-300 transition-transform hover:scale-105 active:scale-95 snap-start ${avatarImage === null ? 'ring-4 ring-offset-2 ring-offset-paper ring-accent shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border border-rule'}`}
              title="Use initials"
            >
              {user.name.substring(0, 2).toUpperCase()}
            </button>
            {avatarImages.map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => setAvatarImage(img)}
                className={`flex-shrink-0 w-16 h-16 rounded-full transition-transform hover:scale-105 active:scale-95 snap-start ${avatarImage === img ? 'ring-4 ring-offset-2 ring-offset-paper ring-accent shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'ring-1 ring-rule'}`}
              >
                <img src={img} className="w-full h-full object-cover rounded-full" alt="Avatar option" />
              </button>
            ))}
          </div>
        </div>

        {avatarImage === null && (
          <div className="animate-fade-up">
            <p className="text-xs text-ink-500 mb-2 font-medium uppercase tracking-wider">Initials Color</p>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setAvatarColor(c.value)}
                  className={`w-10 h-10 rounded-full transition-transform hover:scale-110 active:scale-95 ${avatarColor === c.value ? 'ring-4 ring-offset-2 ring-offset-paper ring-accent' : 'ring-1 ring-rule'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5 pt-4 border-t border-rule/50">
        <label htmlFor="password" className="text-sm font-medium text-ink block">New Password <span className="text-ink-faint font-normal">(Leave blank to keep current)</span></label>
        <input 
          id="password"
          name="password"
          type="password" 
          placeholder="••••••••" 
          minLength={8}
          className="w-full px-4 py-3 bg-paper border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent [transition:border-color_var(--dur-micro)_ease,box-shadow_var(--dur-micro)_ease]"
        />
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-ink text-paper hover:bg-ink/90 font-medium rounded-xl shadow-lg shadow-ink/10 [transition:transform_var(--dur-press)_var(--ease-out),background-color_var(--dur-micro)_ease] active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
