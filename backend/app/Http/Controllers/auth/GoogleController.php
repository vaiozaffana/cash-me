<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Google_Client;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function handleCallbackGoogle(Request $request)
    {
        try {
            $idToken = $request->input('token');

            if (!$idToken) {
                return response()->json(['message' => 'No token provided'], 400);
            }

            $client = new Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
            $payload = $client->verifyIdToken($idToken);

            if ($payload) {
                $email = $payload['email'];
                $name = $payload['name'];

                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'password' => bcrypt(Str::random(16)), // password dummy
                    ]
                );

                $token = $user->createToken('google')->plainTextToken;

                return response()->json(['token' => $token]);
            } else {
                return response()->json(['message' => 'Invalid ID token'], 401);
            }
        } catch (\Exception $err) {
            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong',
                'error' => $err->getMessage()
            ]);
        }
    }
}
