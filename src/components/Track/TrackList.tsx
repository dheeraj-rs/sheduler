import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { TrackListProps } from '../../types/scheduler';
import TrackItem from './TrackItem';
import Modal from '../Modal/Modal';
import TrackForm from './TrackForm';

export default function TrackList({ tracks, onAddTrack, onSelectTrack }: TrackListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center sticky top-0 bg-gray-50 z-10 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Tracks</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Add Track
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {tracks.map((track, index) => (
          <div key={track.id} className="snap-start min-w-[300px] max-w-[300px]">
            <TrackItem
              track={track}
              onSelect={() => onSelectTrack(track.id)}
              colorIndex={index}
            />
          </div>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Track"
      >
        <TrackForm
          onSubmit={(trackData) => {
            onAddTrack(trackData);
            setIsAddModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}