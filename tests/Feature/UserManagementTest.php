<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_users_page(): void
    {
        $response = $this->get(route('users.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_users_list(): void
    {
        $user = User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $response = $this->actingAs($user)->get(route('users.index'));

        $response->assertOk();
    }

    public function test_can_create_a_single_user(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'Sakib Al Hasan',
            'email' => 'sakib@example.com',
            'password' => 'secret123',
            'role' => 'candidate',
        ]);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'name' => 'Sakib Al Hasan',
            'email' => 'sakib@example.com',
            'role' => 'candidate',
        ]);

        $created = User::where('email', 'sakib@example.com')->first();
        $this->assertTrue(Hash::check('secret123', $created->password));
    }

    public function test_can_create_multiple_users_in_bulk(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'users' => [
                [
                    'name' => 'Student One',
                    'email' => 'student1@example.com',
                    'password' => 'pass1234',
                    'role' => 'candidate',
                ],
                [
                    'name' => 'Student Two',
                    'email' => 'student2@example.com',
                    'password' => 'pass1234',
                    'role' => 'candidate',
                ],
                [
                    'name' => 'Admin Two',
                    'email' => 'admin2@example.com',
                    'password' => 'pass1234',
                    'role' => 'admin',
                ],
            ],
        ]);

        $response->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', ['email' => 'student1@example.com', 'role' => 'candidate']);
        $this->assertDatabaseHas('users', ['email' => 'student2@example.com', 'role' => 'candidate']);
        $this->assertDatabaseHas('users', ['email' => 'admin2@example.com', 'role' => 'admin']);
    }

    public function test_validates_unique_email_when_creating_user(): void
    {
        $admin = User::factory()->admin()->create();
        $existing = User::factory()->create(['email' => 'duplicate@example.com']);

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'Duplicate Candidate',
            'email' => 'duplicate@example.com',
            'password' => 'secret123',
            'role' => 'candidate',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_can_update_user_details_and_role(): void
    {
        $admin = User::factory()->admin()->create();
        $candidate = User::factory()->create(['role' => 'candidate']);

        $response = $this->actingAs($admin)->put(route('users.update', $candidate), [
            'name' => 'Promoted Admin',
            'email' => $candidate->email,
            'role' => 'admin',
            'password' => 'newpassword123',
        ]);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $candidate->id,
            'name' => 'Promoted Admin',
            'role' => 'admin',
        ]);

        $updated = $candidate->fresh();
        $this->assertTrue(Hash::check('newpassword123', $updated->password));
    }

    public function test_can_delete_another_user(): void
    {
        $admin = User::factory()->admin()->create();
        $userToDelete = User::factory()->create();

        $response = $this->actingAs($admin)->delete(route('users.destroy', $userToDelete));

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
    }

    public function test_cannot_delete_own_account_via_users_controller(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
        $response->assertSessionHas('error');
    }
}
