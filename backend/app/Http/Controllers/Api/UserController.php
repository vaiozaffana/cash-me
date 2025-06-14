<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserCollection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request) {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized (token invalid)'], 401);
        }

        return response()->json([
            'user' => $user,
            'transactions' => []
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function register(Request $request)
    {
        try {

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('authToken')->plainTextToken;

            return response()->json([
                "status" => "success",
                "message" => "Registered Successfully",
                "user" => $user,
                "token" => $token,
                "type" => "bearer"
            ], 200);
        } catch (\Exception $err) {
            return response()->json([
                "status" => "error",
                "message" => "Something Went Wrong",
                "error" => $err->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'error' => 'Unauthorized',
                    'message' => 'Invalid login details'
                ], 401);
            }

            $token = $user->createToken('authtoken')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Login Succesfully',
                'user' => $user,
                'token' => $token,
                'type' => 'bearer'
            ], 200);
        } catch (\Exception $err) {
            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong',
                'error' => $err->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User logged is successfully',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'sometimes|required|string|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);
        $user->refresh();

        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json([
            'message' => 'User deleted successfully',
            'user' => new UserResource($user)
        ]);
    }
}
