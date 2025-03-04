import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Crown } from 'lucide-react';

export const Leaderboard = () => {
  const leaders = [
    { id: '1', name: 'T S Sarang', points: 1950, rank: 1, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '2', name: 'Pannaga J P', points: 1510, rank: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '3', name: 'Parth Agarwal', points: 930, rank: 3, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-8 mb-8">
            {leaders.slice(0, 3).map((leader, index) => (
              <div key={leader.id} className="flex flex-col items-center">
                <div className="relative">
                  {index === 0 && (
                    <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-400" />
                  )}
                  <Avatar
                    src={leader.avatar}
                    alt={leader.name}
                    size="lg"
                    className={`border-4 ${
                      index === 0 ? 'border-yellow-400' :
                      index === 1 ? 'border-gray-400' :
                      'border-orange-400'
                    }`}
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 text-white w-6 h-6 flex items-center justify-center text-sm">
                    {leader.rank}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="font-medium text-gray-900">{leader.name}</div>
                  <div className="text-sm text-gray-500">{leader.points} points</div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {leaders.map((leader) => (
              <div
                key={leader.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-medium text-gray-500">#{leader.rank}</span>
                  <Avatar
                    src={leader.avatar}
                    alt={leader.name}
                    size="sm"
                  />
                  <span className="font-medium text-gray-900">{leader.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-blue-600">{leader.points}</span>
                  <span className="text-gray-500">points</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};