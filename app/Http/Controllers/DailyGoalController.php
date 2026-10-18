<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DailyGoalController extends Controller
{
    /**
     * Update target goals for today.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'target_questions' => 'required|integer|min:5|max:100',
            'target_quizzes' => 'required|integer|min:1|max:10',
        ]);

        $goal = $request->user()->getTodayGoal();
        $goal->update($validated);

        return redirect()->back()->with('success', 'ডেইলি স্টাডি গোল আপডেট করা হয়েছে!');
    }
}
