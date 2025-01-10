import React, { useState } from 'react';
import { TrackFormProps } from '../../types/scheduler';

export default function TrackForm({ onSubmit, initialData }: TrackFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Track Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        >
          Save Track
        </button>
      </div>
    </form>
  );
}