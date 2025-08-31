import axios from 'axios';

const API_BASE_URL = 'https://api.vendorportal.com'; // Replace with your actual API base URL

// Function to fetch purchase orders
export const fetchPurchaseOrders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/purchase-orders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        throw error;
    }
};

// Function to fetch pending approvals
export const fetchPendingApprovals = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/pending-approvals`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
    }
};

// Function to fetch invoices
export const fetchInvoices = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/invoices`);
        return response.data;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

// Function to fetch vendors
export const fetchVendors = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/vendors`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vendors:', error);
        throw error;
    }
};

// Function to fetch announcements
export const fetchAnnouncements = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/announcements`);
        return response.data;
    } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
    }
};

// Function to fetch alerts
export const fetchAlerts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/alerts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        throw error;
    }
};

// Function to fetch tasks
export const fetchTasks = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tasks`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};