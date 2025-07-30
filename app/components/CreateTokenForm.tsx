import React, { useState } from 'react';

interface CreateTokenFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function CreateTokenForm({ onSubmit, loading }: CreateTokenFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    initialSupply: 1000000,
    hasTransferHook: true,
    hookProgram: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: name === 'decimals' || name === 'initialSupply' ? Number(val) : val,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-indigo-800/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/50">
      <h2 className="text-2xl font-bold mb-4">Create Token-2022</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="name">
            Token Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="My Token"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="symbol">
            Symbol
          </label>
          <input
            id="symbol"
            name="symbol"
            type="text"
            value={formData.symbol}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="TKN"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="decimals">
            Decimals
          </label>
          <input
            id="decimals"
            name="decimals"
            type="number"
            min="0"
            max="18"
            value={formData.decimals}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="initialSupply">
            Initial Supply
          </label>
          <input
            id="initialSupply"
            name="initialSupply"
            type="number"
            min="1"
            value={formData.initialSupply}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            id="hasTransferHook"
            name="hasTransferHook"
            type="checkbox"
            checked={formData.hasTransferHook}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 bg-indigo-900/50 border-indigo-700 rounded focus:ring-indigo-500"
          />
          <label className="ml-2 block text-sm font-medium" htmlFor="hasTransferHook">
            Enable Transfer Hook
          </label>
        </div>

        {formData.hasTransferHook && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="hookProgram">
              Hook Program Address
            </label>
            <input
              id="hookProgram"
              name="hookProgram"
              type="text"
              value={formData.hookProgram}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Hook program address"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg transition"
        >
          {loading ? 'Creating...' : 'Create Token'}
        </button>
      </form>
    </div>
  );
}