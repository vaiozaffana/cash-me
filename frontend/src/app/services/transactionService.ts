import apiClient from "@/lib/axios";

export const TransactionService = {
  async createTransaction(data: {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    note?: string;
    date: string;
  }) {
    try {
      const response = await apiClient.post('/transactions', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getTransactions() {
    try {
      const response = await apiClient.get('/transactions');
      return response.data.transactions || [];
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getSummary() {
    try {
      const response = await apiClient.get('/transactions/summary');
      return {
        balance: Number(response.data.balance) || 0,
        income: Number(response.data.income) || 0,
        expense: Number(response.data.expense) || 0,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: any) {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(
        error.response.data.message || 
        'Terjadi kesalahan saat memproses permintaan'
      );
    } else {
      throw new Error('Koneksi jaringan bermasalah');
    }
  }
};