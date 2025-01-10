import { Layers } from 'lucide-react';
import { TrackItemProps } from '../../types/scheduler';

const trackColors = [
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
] as const;

export default function TrackItem({ track, onSelect, colorIndex }: TrackItemProps) {
  const colorClass = trackColors[colorIndex % trackColors.length];
  const borderColor = colorClass.split(' ')[0].replace('bg-', 'border-');

  return (
    <div
      onClick={onSelect}
      className={`p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${borderColor}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colorClass} mt-1`}>
            <Layers className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
              {track.name}
            </h3>
            <div className="text-xs text-gray-600">
              {track.sections.length} section{track.sections.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}