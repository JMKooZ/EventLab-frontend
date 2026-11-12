<script setup>
const api = useApi();

const code = ref("");
const result = ref(null);
const error = ref("");

const run = async () => {
  result.value = null;
  error.value = "";

  try {
    result.value = await api.get(`/api/events/invite/${code.value.trim()}`);
  } catch (e) {
    error.value = `${e.status} ${e.message}`;
  }
};
</script>

<template>
  <main style="padding: 24px">
    <h1>API 연결 확인 (임시)</h1>
    <input v-model="code" placeholder="초대 코드" />
    <button @click="run">조회</button>

    <pre v-if="result">{{ result }}</pre>
    <p v-if="error">{{ error }}</p>
  </main>
</template>
