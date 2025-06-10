<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/users', [UserController::class, 'index']);
Route::post('/users/store', [UserController::class, 'store']);
Route::get('/users/show/{id}', [UserController::class, 'show']);
Route::delete('/users/delete/{id}', [UserController::class, 'destroy']);
Route::put('/users/update/{id}', [UserController::class, 'update']);