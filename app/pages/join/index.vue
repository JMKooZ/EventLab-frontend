<script setup>
import { ref } from "vue";

const inviteCode = ref("");
const errorMessage = ref("");

const submitInviteCode = async () => {
  const code = inviteCode.value.trim().toUpperCase();

  if (!code) {
    errorMessage.value = "초대 코드를 입력해 주세요.";
    return;
  }

  if (!/^[A-Z0-9]{6,10}$/.test(code)) {
    errorMessage.value =
      "초대 코드는 영문 대문자와 숫자 6~10자리로 입력해 주세요.";
    return;
  }

  errorMessage.value = "";
  await navigateTo(`/join/${code}`);
};
</script>

<template>
  <div class="guest-join-page">
    <main class="guest-join-main">
      <section class="join-card">
        <div class="join-icon">✦</div>

        <p class="eyebrow">JOIN EVENT</p>
        <h1>이벤트에 참여하기</h1>
        <p class="join-description">
          진행자로부터 전달받은 초대 코드를 입력해 주세요.
        </p>

        <form class="join-form" @submit.prevent="submitInviteCode">
          <label for="inviteCode">초대 코드</label>

          <input
            id="inviteCode"
            v-model="inviteCode"
            type="text"
            maxlength="10"
            placeholder="예: EVT2026"
            autocomplete="off"
            autocapitalize="characters"
            @input="inviteCode = inviteCode.toUpperCase()"
          />

          <p v-if="errorMessage" class="join-error">
            {{ errorMessage }}
          </p>

          <button type="submit" class="primary-button join-submit-button">
            다음 단계
            <span>→</span>
          </button>
        </form>

        <div class="join-help">
          <span>ⓘ</span>
          초대 코드를 받지 못했다면 이벤트 진행자에게 문의해 주세요.
        </div>
      </section>
    </main>
  </div>
</template>
