const BASE_URL = 'http://localhost:8000';

export const api = {
    createGroup: async () => {
        const response = await fetch(`${BASE_URL}/group/create`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to create group');
        return response.json();
    },

    joinGroup: async (groupId) => {
        const response = await fetch(`${BASE_URL}/group/join/${groupId}`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to join group');
        return response.json();
    },

    submitPreferences: async (groupId, userId, prefs) => {
        const response = await fetch(`${BASE_URL}/group/submit/${groupId}/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs),
        });
        if (!response.ok) throw new Error('Failed to submit preferences');
        return response.json();
    },

    getGroupStatus: async (groupId) => {
        const response = await fetch(`${BASE_URL}/group/status/${groupId}`);
        if (!response.ok) throw new Error('Failed to get group status');
        return response.json();
    },

    computeGroup: async (groupId) => {
        const response = await fetch(`${BASE_URL}/group/compute/${groupId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to compute group');
        }
        return response.json();
    },

    getResults: async (groupId) => {
        const response = await fetch(`${BASE_URL}/group/result/${groupId}`);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to fetch results');
        }
        return response.json();
    }
};
