<?php

use App\Http\Controllers\Api\TransactionController as ApiTransactionController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\auth\GoogleController;
use App\Http\Controllers\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/auth/google-exchange', [GoogleController::class, 'handleCallbackGoogle']);

Route::middleware('auth:sanctum')->group( function() {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/transactions', [ApiTransactionController::class, 'index']);
    Route::post('/transactions', [ApiTransactionController::class, 'store']);
    Route::get('/transactions/summary', [ApiTransactionController::class, 'summary']);
});

Route::get('/users', [UserController::class, 'index']);
// Route::post('/users/store', [UserController::class, 'store']);
Route::get('/users/show/{id}', [UserController::class, 'show']);
Route::delete('/users/delete/{id}', [UserController::class, 'destroy']);
Route::put('/users/update/{id}', [UserController::class, 'update']);
