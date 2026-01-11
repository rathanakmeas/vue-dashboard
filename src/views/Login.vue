<template>
  <div class="login-container">
    <div class="login-box">
      <h1>ចូលប្រើប្រាស់</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>ឈ្មោះអ្នកប្រើ</label>
          <input v-model="credentials.username" type="text" placeholder="ឈ្មោះអ្នកប្រើ" />
        </div>
        <div class="form-group">
          <label>ពាក្យសម្ងាត់</label>
          <input v-model="credentials.password" type="password" placeholder="ពាក្យសម្ងាត់" />
        </div>
        <button type="submit" class="btn-login">ចូល</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const router = useRouter();
const credentials = ref({
  username: '',
  password: ''
});

const handleLogin = async () => {
  try {
    const response = await api.post('/auth/login', credentials.value);
    localStorage.setItem('token', response.data.token);
    router.push('/');
  } catch (error) {
    alert('ម៉ាក់ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-box h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
</style>
