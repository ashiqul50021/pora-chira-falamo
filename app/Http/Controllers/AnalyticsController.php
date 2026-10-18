<?php

namespace App\Http\Controllers;

use App\Services\StreakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        protected StreakService $streakService
    ) {}

    /**
     * Display weekly performance analytics and weak topic breakdown.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $performance = $this->streakService->getWeeklyPerformance($user);

        return Inertia::render('Analytics/Index', [
            'performance' => $performance,
        ]);
    }

    /**
     * Generate personalized AI study feedback and recommendations using Gemini.
     */
    public function getAiAdvice(Request $request): JsonResponse
    {
        $user = $request->user();
        $performance = $this->streakService->getWeeklyPerformance($user);
        $advice = $this->streakService->generateAiWeeklyAdvice($user, $performance);

        return response()->json([
            'success' => true,
            'advice' => $advice,
        ]);
    }
}
