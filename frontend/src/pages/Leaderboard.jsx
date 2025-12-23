import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/firestoreUserService';
import { BADGES } from '../services/firestoreUserService';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const data = await getLeaderboard(20);
            setLeaders(data);
        } catch (error) {
            console.error('Failed to load leaderboard', error);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeIcon = (points) => {
        // Find the highest badge achieved
        const badge = [...BADGES].reverse().find(b => points >= b.threshold);
        return badge ? badge.icon : '🌱'; // Default to seedling
    };

    const getBadgeName = (points) => {
        const badge = [...BADGES].reverse().find(b => points >= b.threshold);
        return badge ? badge.name : 'Newbie';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex justify-center items-center gap-3">
                        <FiAward className="text-yellow-500" /> Civic Champions
                    </h1>
                    <p className="text-gray-600">Celebrating our most active citizens</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Top Contributors</h2>
                            <p className="text-blue-100 text-sm">Earn points by reporting verified issues</p>
                        </div>
                        <FiTrendingUp className="text-4xl opacity-20" />
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading champions...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Rank</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Citizen</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Badges</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaders.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-500">No data yet. Be the first to report!</td>
                                        </tr>
                                    ) : (
                                        leaders.map((leader, index) => (
                                            <tr key={leader.id} className={`hover:bg-blue-50 transition ${index < 3 ? 'bg-yellow-50/30' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                 ${index === 0 ? 'bg-yellow-400 text-white' :
                                                            index === 1 ? 'bg-gray-300 text-white' :
                                                                index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}
                               `}>
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{leader.displayName}</div>
                                                    <div className="text-xs text-gray-500">{getBadgeName(leader.points)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-2xl" title={getBadgeName(leader.points)}>
                                                        {getBadgeIcon(leader.points)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                                    {leader.points} pts
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
