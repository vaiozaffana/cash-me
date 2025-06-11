<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function summary(Request $request) {
        $user = $request->user();

        $income = Transaction::where('user_id', $user->id)->where('type', 'income')->sum('amount');
        $expense = Transaction::where('user_id', $user->id)->where('type', 'expense')->sum('amount');

        $balance = $income - $expense;

        return response()->json([
            'balance' => $balance,
            'income' => $income,
            'expense' => $expense
        ], 200);
    }

    public function index(Request $request) {
        try {
        $user = $request->user();

        $transactions = Transaction::where('user_id', $user->id)
        ->orderBy('date', 'desc')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'status' => 'success',
            'transactions' => $transactions
        ]);
    } catch (\Exception $err) {
        return response()->json([
            'status' => 'error',
            'message' => 'Something went wrong',
            'error' => $err->getMessage()
        ]);
    }
    // $user = $request->user(); // pastikan pakai sanctum/jwt middleware

    // $transactions = Transaction::where('user_id', $user->id)->get();

    // return response()->json([
    //     'user' => $user,
    //     'transactions' => $transactions,
    // ]);
    }

    public function store(Request $request)
    {
        try {
        $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'amount' => 'required|integer',
            'note' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $user = $request->user();

        $transaction = Transaction::create([
            'user_id' => $user->id, // pastikan kamu pakai sanctum atau auth
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'note' => $request->note,
            'date' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil ditambahkan',
            'transaction' => $transaction,
        ], 201);
    } catch (\Exception $err) {
        return response()->json([
            'status' => 'error',
            'message' => 'Something went wrong',
            'transaction' => $err->getMessage(),
        ]);
    }
}
}
