<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Connexion</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="username" class="block text-gray-700">Email</label>
          <input
            v-model="form.username"
            id="username"
            type="text"
            required
            class="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>

        <div class="mb-4">
          <label for="password" class="block text-gray-700">Password</label>
          <input
            v-model="form.password"
            id="password"
            type="password"
            required
            class="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200"
          />
        </div>

        <div v-if="error" class="mb-4 text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '../stores/useAxios.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  username: '',
  password: '',
})

const error = ref('')

const handleLogin = async () => {
  try {
    error.value = ''
    const response = await axios.post('/api/users/login', form.value)
    console.log('Connecté avec succès', response.data)
    router.push('/')
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || "Échec de la connexion"
  }
}
</script>
