import { data } from "jquery";
import { useState } from "react";

export default function addStandard({ onClose, onSave, sessionData }){
    const [title, setTitle] = useState("");
  const [shortName, setShortName] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${sessionData.url}/school_setup/master_setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData?.token}`, // pass token if available
        },
        body: JSON.stringify({
          type: "API",
          sub_institute_id:sessionData.sub_institute_id,
          user_id:sessionData.user_id,
          token:sessionData.token,
          formType : 'types',
          title,
          short_name: shortName,
          sort_order: sortOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      data = await response.json();
      alert(data.message || 'Academic saved successfully');
      onSave(); // reload data
      onClose(); // close dialog
    } catch (err) {
      console.error("Error saving academic:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Short Name</label>
        <input
          type="text"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Sort Order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1 rounded-full text-white font-semibold bg-gradient-to-r from-gray-500 to-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}