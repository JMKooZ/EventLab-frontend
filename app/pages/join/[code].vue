<script setup>
import { computed, ref } from "vue";

const route = useRoute();

const inviteCode = computed(() =>
  String(route.params.code || "").toUpperCase(),
);

const nickname = ref("");
const errorMessage = ref("");
const isJoined = ref(false);

// 백엔드 연결 전 화면 확인용 더미 데이터
const event = {
  id: 1,
  title: "2026 개발팀 워크숍",
  description: "개발팀 구성원들과 함께하는 실시간 설문 이벤트입니다.",
  eventType: "POLL",
  hostName: "EventLab 진행자",
  participantCount: 24,
  maxParticipants: 100,
  status: "RUNNING",
};

const eventTypeLabel = computed(() =>
  event.eventType === "QUIZ" ? "퀴즈" : "설문",
);

const submitNickname = async () => {
  const value = nickname.value.trim();

  if (!value) {
    errorMessage.value = "닉네임을 입력해 주세요.";
    return;
  }

  if (value.length < 2 || value.length > 12) {
    errorMessage.value = "닉네임은 2~12자로 입력해 주세요.";
    return;
  }

  if (event.status === "ENDED") {
    errorMessage.value = "종료된 이벤트입니다.";
    return;
  }

  if (event.participantCount >= event.maxParticipants) {
    errorMessage.value = "참여 인원이 모두 찼습니다.";
    return;
  }

  if (event.status === "PAUSED") {
    errorMessage.value = "현재 이벤트가 일시정지 상태입니다.";
    return;
  }

  if (event.status === "WAITING") {
    errorMessage.value = "이벤트가 시작될 때까지 대기해 주세요.";
    return;
  }

  if (event.status !== "RUNNING") {
    errorMessage.value = "현재 참여할 수 없는 이벤트입니다.";
    return;
  }

  errorMessage.value = "";

  await navigateTo({
    path: `/play/${event.id}`,
    query: {
      nickname: value,
    },
  });
};
</script>

<template>
  <div class="guest-join-page">
    <main class="guest-join-main">
      <section class="join-card event-join-card">
        <template v-if="!isJoined">
          <div class="join-icon">✦</div>

          <p class="eyebrow">EVENT INFORMATION</p>
          <h1>이벤트에 참여하시겠어요?</h1>
          <p class="join-description">참여할 이벤트의 정보를 확인해 주세요.</p>

          <div class="event-preview-card">
            <div class="event-preview-top">
              <span class="event-type-label">{{ eventTypeLabel }}</span>
              <span class="event-waiting-label">참여 가능</span>
            </div>

            <h2>{{ event.title }}</h2>
            <p>{{ event.description }}</p>

            <div class="event-preview-info">
              <div>
                <span>진행자</span>
                <strong>{{ event.hostName }}</strong>
              </div>

              <div>
                <span>참여 인원</span>
                <strong>
                  {{ event.participantCount }} / {{ event.maxParticipants }}명
                </strong>
              </div>

              <div>
                <span>초대 코드</span>
                <strong>{{ inviteCode }}</strong>
              </div>
            </div>
          </div>

          <form
            class="join-form nickname-form"
            @submit.prevent="submitNickname"
          >
            <label for="nickname">사용할 닉네임</label>

            <input
              id="nickname"
              v-model="nickname"
              type="text"
              maxlength="12"
              placeholder="닉네임을 입력해 주세요."
              autocomplete="nickname"
            />

            <p class="nickname-guide">
              이벤트 내에서 다른 참여자와 구분할 닉네임을 입력해 주세요.
              (2~12자)
            </p>

            <p v-if="errorMessage" class="join-error">
              {{ errorMessage }}
            </p>

            <button type="submit" class="primary-button join-submit-button">
              참여하기
              <span>→</span>
            </button>
          </form>
        </template>

        <div v-else class="join-complete">
          <div class="join-complete-icon">✓</div>

          <p class="eyebrow">READY TO JOIN</p>
          <h1>참여 준비가 완료되었습니다.</h1>
          <p class="join-description">
            <strong>{{ nickname.trim() }}</strong> 님, 이벤트 참여 준비가
            완료되었습니다.
          </p>

          <div class="join-complete-info">
            <span>참여 이벤트</span>
            <strong>{{ event.title }}</strong>
          </div>

          <p class="join-help">
            현재는 화면 확인 단계입니다. 실제 참여 등록과 질문 화면 이동은
            백엔드 및 참여 화면 연결 단계에서 구현합니다.
          </p>

          <NuxtLink to="/" class="secondary-button join-home-button">
            대시보드로 이동
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>
