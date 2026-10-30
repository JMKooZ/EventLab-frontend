<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

const route = useRoute();

const nickname = computed(() => {
  const value = route.query.nickname;
  return typeof value === "string" && value.trim() ? value.trim() : "참여자";
});

// 백엔드 연결 전 더미 데이터
const event = ref({
  id: Number(route.params.eventId),
  title: "2026 개발팀 워크숍",
  eventType: "POLL",
  status: "RUNNING",
});

const question = ref({
  id: 1,
  questionOrder: 1,
  content: "가장 선호하는 개발 언어는 무엇인가요?",
  timeLimitEnabled: false,
  timeLimitSeconds: 30,
  options: [
    { id: 1, content: "Java", count: 12 },
    { id: 2, content: "JavaScript", count: 8 },
    { id: 3, content: "Python", count: 6 },
    { id: 4, content: "Kotlin", count: 4 },
  ],
});

const selectedOptionId = ref(null);
const submitted = ref(false);
const remainingSeconds = ref(question.value.timeLimitSeconds);
const timeExpired = ref(false);

let timerId = null;

const isQuiz = computed(() => event.value.eventType === "QUIZ");

const totalVotes = computed(() =>
  question.value.options.reduce((total, option) => total + option.count, 0),
);

const selectedOption = computed(() =>
  question.value.options.find((option) => option.id === selectedOptionId.value),
);

const getPercentage = (count) => {
  if (totalVotes.value === 0) return 0;

  return Math.round((count / totalVotes.value) * 100);
};

const startTimer = () => {
  if (!question.value.timeLimitEnabled) return;

  remainingSeconds.value = question.value.timeLimitSeconds;

  timerId = setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0;
      timeExpired.value = true;
      clearInterval(timerId);
      timerId = null;
      return;
    }

    remainingSeconds.value -= 1;
  }, 1000);
};

const submitAnswer = () => {
  if (submitted.value || timeExpired.value) return;
  if (!selectedOptionId.value) return;

  const option = question.value.options.find(
    (item) => item.id === selectedOptionId.value,
  );

  if (!option) return;

  option.count += 1;
  submitted.value = true;

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const goBack = async () => {
  await navigateTo("/");
};

onMounted(() => {
  if (event.value.status !== "RUNNING") return;

  startTimer();
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});
</script>

<template>
  <main class="play-page">
    <div class="play-container">
      <!-- Event Header -->
      <header class="play-header">
        <NuxtLink to="/" class="play-logo">
          <span class="play-logo-mark">E</span>
          EventLab
        </NuxtLink>

        <div class="play-user">
          <span class="play-user-dot"></span>
          {{ nickname }}
        </div>
      </header>

      <!-- Event Information -->
      <section class="play-event-info">
        <span class="play-event-type">
          {{ isQuiz ? "QUIZ EVENT" : "POLL EVENT" }}
        </span>

        <h1>{{ event.title }}</h1>

        <div class="play-progress">
          <span>QUESTION {{ question.questionOrder }}</span>
          <span>진행 중</span>
        </div>
      </section>

      <!-- Question -->
      <section class="play-question-card">
        <div class="play-question-heading">
          <span class="play-question-number">
            Q{{ question.questionOrder }}
          </span>

          <div
            v-if="question.timeLimitEnabled"
            class="play-timer"
            :class="{ urgent: remainingSeconds <= 10 }"
          >
            <span>⏱</span>
            {{ remainingSeconds }}초
          </div>
        </div>

        <h2>{{ question.content }}</h2>

        <p class="play-question-guide">
          {{
            submitted
              ? "답변이 제출되었습니다."
              : "아래 선택지 중 하나를 선택해 주세요."
          }}
        </p>

        <!-- Options -->
        <div class="play-option-list">
          <button
            v-for="(option, index) in question.options"
            :key="option.id"
            type="button"
            class="play-option"
            :class="{
              selected: selectedOptionId === option.id,
              disabled: submitted || timeExpired,
            }"
            :disabled="submitted || timeExpired"
            @click="selectedOptionId = option.id"
          >
            <span class="play-option-number">
              {{ index + 1 }}
            </span>

            <span class="play-option-content">
              {{ option.content }}
            </span>

            <span
              v-if="selectedOptionId === option.id"
              class="play-option-check"
            >
              ✓
            </span>
          </button>
        </div>

        <!-- Submit -->
        <button
          v-if="!submitted && !timeExpired"
          type="button"
          class="primary-button play-submit-button"
          :disabled="!selectedOptionId"
          @click="submitAnswer"
        >
          답변 제출하기
          <span>→</span>
        </button>

        <div v-if="timeExpired && !submitted" class="play-result-notice">
          답변 시간이 종료되었습니다.
        </div>

        <!-- Submitted -->
        <div v-if="submitted" class="play-submitted">
          <div class="play-submitted-icon">✓</div>

          <h3>답변이 제출되었습니다.</h3>

          <p>
            선택한 답변:
            <strong>{{ selectedOption?.content }}</strong>
          </p>

          <div v-if="isQuiz" class="play-result-notice">
            정답은 진행자가 질문을 마감한 후 공개됩니다.
          </div>

          <template v-else>
            <div class="play-poll-results">
              <h3>현재 응답 결과</h3>

              <div
                v-for="option in question.options"
                :key="option.id"
                class="play-result-item"
              >
                <div class="play-result-label">
                  <span>{{ option.content }}</span>
                  <strong>{{ getPercentage(option.count) }}%</strong>
                </div>

                <div class="play-result-track">
                  <div
                    class="play-result-bar"
                    :style="{ width: `${getPercentage(option.count)}%` }"
                  ></div>
                </div>
              </div>

              <p class="play-result-total">총 {{ totalVotes }}명 응답</p>
            </div>
          </template>
        </div>
      </section>

      <p class="play-footer-message">
        진행자가 다음 질문을 시작할 때까지 잠시 기다려 주세요.
      </p>
    </div>
  </main>
</template>
