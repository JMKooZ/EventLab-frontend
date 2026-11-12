<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

const route = useRoute();
const nickname = computed(() => {
  const value = route.query.nickname;
  return typeof value === "string" && value.trim() ? value.trim() : "참여자";
});

// API 연동 전 화면 확인용 데이터입니다.
const event = ref({
  id: Number(route.params.eventId),
  title: "2026 개발팀 워크숍 만족도 조사",
  description: "워크숍에 대한 의견을 남겨주세요.",
  status: "RUNNING",
  currentQuestionIndex: 0,
});

const questions = ref([
  {
    id: 1,
    questionOrder: 1,
    content: "이번 워크숍에서 가장 만족스러웠던 부분은 무엇인가요?",
    questionType: "SINGLE_CHOICE",
    isRequired: true,
    allowOther: true,
    timeLimitEnabled: false,
    timeLimitSeconds: 30,
    options: [
      { id: 1, content: "프로그램 구성", count: 18 },
      { id: 2, content: "장소 및 시설", count: 12 },
      { id: 3, content: "식사 및 다과", count: 9 },
      { id: 4, content: "팀 네트워킹", count: 15 },
    ],
  },
  {
    id: 2,
    questionOrder: 2,
    content: "다음 워크숍에서 다뤘으면 하는 주제를 선택해주세요.",
    questionType: "MULTIPLE_CHOICE",
    isRequired: true,
    allowOther: true,
    maxSelections: 2,
    timeLimitEnabled: false,
    options: [
      { id: 5, content: "AI 활용", count: 20 },
      { id: 6, content: "개발 생산성", count: 16 },
      { id: 7, content: "협업 문화", count: 11 },
      { id: 8, content: "기술 트렌드", count: 8 },
    ],
  },
  {
    id: 3,
    questionOrder: 3,
    content: "워크숍에서 가장 기억에 남는 내용을 적어주세요.",
    questionType: "SHORT_TEXT",
    isRequired: false,
    textMaxLength: 100,
    timeLimitEnabled: false,
    options: [],
  },
  {
    id: 4,
    questionOrder: 4,
    content: "워크숍 전반에 대한 의견이나 개선점을 자유롭게 작성해주세요.",
    questionType: "LONG_TEXT",
    isRequired: false,
    textMaxLength: 1000,
    timeLimitEnabled: false,
    options: [],
  },
  {
    id: 5,
    questionOrder: 5,
    content: "이번 워크숍을 전반적으로 얼마나 만족하셨나요?",
    questionType: "RATING",
    isRequired: true,
    scaleMin: 1,
    scaleMax: 5,
    scaleMinLabel: "매우 불만족",
    scaleMaxLabel: "매우 만족",
    timeLimitEnabled: false,
    ratingResults: [
      { score: 1, count: 1 },
      { score: 2, count: 2 },
      { score: 3, count: 5 },
      { score: 4, count: 14 },
      { score: 5, count: 18 },
    ],
    options: [],
  },
]);

const currentIndex = ref(0);
const answers = ref({});
const otherAnswers = ref({});
const submittedQuestionIds = ref([]);
const remainingSeconds = ref(0);
const timeExpired = ref(false);
const validationMessage = ref("");
const resultVisible = ref(false);
let timerId = null;

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isSubmitted = computed(() => submittedQuestionIds.value.includes(currentQuestion.value?.id));
const isEnded = computed(() => event.value.status === "ENDED");
const isPaused = computed(() => event.value.status === "PAUSED");
const progressPercent = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100);
const answerValue = computed({
  get: () => answers.value[currentQuestion.value?.id],
  set: (value) => { answers.value[currentQuestion.value.id] = value; },
});
const selectedCount = computed(() => Array.isArray(answerValue.value) ? answerValue.value.length : 0);
const questionTypeLabel = computed(() => ({
  SINGLE_CHOICE: "단일 선택",
  MULTIPLE_CHOICE: "다중 선택",
  SHORT_TEXT: "단답형",
  LONG_TEXT: "장문형",
  RATING: "척도형",
}[currentQuestion.value?.questionType] || "설문"));
const totalResponses = computed(() => {
  if (currentQuestion.value?.questionType === "RATING") {
    return currentQuestion.value.ratingResults?.reduce((sum, item) => sum + item.count, 0) || 0;
  }
  return currentQuestion.value?.options?.reduce((sum, option) => sum + option.count, 0) || 0;
});

const percentage = (count) => totalResponses.value ? Math.round((count / totalResponses.value) * 100) : 0;
const isChoiceType = computed(() => ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(currentQuestion.value?.questionType));
const isTextType = computed(() => ["SHORT_TEXT", "LONG_TEXT"].includes(currentQuestion.value?.questionType));

const toggleOption = (optionId) => {
  if (isSubmitted.value || timeExpired.value) return;
  validationMessage.value = "";
  if (currentQuestion.value.questionType === "SINGLE_CHOICE") {
    answerValue.value = optionId;
    return;
  }
  const selected = Array.isArray(answerValue.value) ? [...answerValue.value] : [];
  const index = selected.indexOf(optionId);
  if (index >= 0) selected.splice(index, 1);
  else {
    const max = currentQuestion.value.maxSelections;
    if (max && selected.length >= max) {
      validationMessage.value = `최대 ${max}개까지 선택할 수 있습니다.`;
      return;
    }
    selected.push(optionId);
  }
  answerValue.value = selected;
};

const isOptionSelected = (id) => currentQuestion.value.questionType === "SINGLE_CHOICE"
  ? answerValue.value === id
  : Array.isArray(answerValue.value) && answerValue.value.includes(id);

const startTimer = () => {
  clearTimer();
  timeExpired.value = false;
  if (!currentQuestion.value?.timeLimitEnabled || isSubmitted.value) return;
  remainingSeconds.value = currentQuestion.value.timeLimitSeconds;
  timerId = setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0;
      timeExpired.value = true;
      clearTimer();
      return;
    }
    remainingSeconds.value -= 1;
  }, 1000);
};

const clearTimer = () => {
  if (timerId) clearInterval(timerId);
  timerId = null;
};

const hasAnswer = () => {
  const value = answerValue.value;
  const hasOtherAnswer = Boolean(otherAnswers.value[currentQuestion.value.id]?.trim());

  if (currentQuestion.value.questionType === "SINGLE_CHOICE") {
    return (value !== undefined && value !== null) || hasOtherAnswer;
  }
  if (currentQuestion.value.questionType === "MULTIPLE_CHOICE") {
    return (Array.isArray(value) && value.length > 0) || hasOtherAnswer;
  }
  if (isTextType.value) return typeof value === "string" && value.trim().length > 0;
  if (currentQuestion.value.questionType === "RATING") return value !== undefined && value !== null;
  return false;
};

const submitAnswer = () => {
  if (isSubmitted.value || timeExpired.value || isPaused.value || isEnded.value) return;
  validationMessage.value = "";
  if (currentQuestion.value.isRequired && !hasAnswer()) {
    validationMessage.value = "필수 질문입니다. 답변을 입력해주세요.";
    return;
  }
  // 현재 단계는 프론트엔드 화면 검증용입니다. 실제 응답 저장과 집계는 API 연동 후 처리합니다.
  submittedQuestionIds.value.push(currentQuestion.value.id);
  resultVisible.value = true;
  clearTimer();
};

const moveToNextQuestion = () => {
  if (currentIndex.value >= questions.value.length - 1) {
    event.value.status = "ENDED";
    return;
  }
  currentIndex.value += 1;
  validationMessage.value = "";
  resultVisible.value = false;
  startTimer();
};

const goToPreviousQuestion = () => {
  if (currentIndex.value <= 0) return;
  currentIndex.value -= 1;
  validationMessage.value = "";
  resultVisible.value = isSubmitted.value;
  startTimer();
};

onMounted(() => startTimer());
onUnmounted(() => clearTimer());
</script>

<template>
  <main class="play-page">
    <div class="play-container">
      <header class="play-header">
        <NuxtLink to="/" class="play-logo">
          <span class="play-logo-mark">E</span>EventLab
        </NuxtLink>
        <div class="play-user"><span class="play-user-dot"></span>{{ nickname }}</div>
      </header>

      <section class="play-event-info">
        <span class="play-event-type">SURVEY</span>
        <h1>{{ event.title }}</h1>
        <p v-if="event.description" class="play-event-description">{{ event.description }}</p>
        <div class="play-progress-info">
          <span>질문 {{ currentIndex + 1 }} / {{ questions.length }}</span>
          <span>{{ isEnded ? "종료" : isPaused ? "일시 정지" : "진행 중" }}</span>
        </div>
        <div class="play-progress-track"><div class="play-progress-bar" :style="{ width: `${progressPercent}%` }"></div></div>
      </section>

      <section v-if="!isEnded" class="play-question-card">
        <div class="play-question-heading">
          <span class="play-question-number">Q{{ currentQuestion.questionOrder }}</span>
          <div class="play-question-badges">
            <span class="play-type-badge">{{ questionTypeLabel }}</span>
            <span v-if="currentQuestion.isRequired" class="play-required-badge">필수</span>
            <span v-if="currentQuestion.timeLimitEnabled" class="play-timer" :class="{ urgent: remainingSeconds <= 10 }">{{ remainingSeconds }}초</span>
          </div>
        </div>

        <h2>{{ currentQuestion.content }}</h2>
        <p class="play-question-guide">
          {{ isSubmitted ? "답변이 제출되었습니다." : isPaused ? "진행자가 설문을 일시 정지했습니다." : timeExpired ? "응답 시간이 종료되었습니다." : "답변을 선택하거나 입력해주세요." }}
        </p>

        <div v-if="isChoiceType" class="play-option-list">
          <button v-for="(option, index) in currentQuestion.options" :key="option.id" type="button" class="play-option"
            :class="{ selected: isOptionSelected(option.id), disabled: isSubmitted || timeExpired || isPaused }"
            :disabled="isSubmitted || timeExpired || isPaused" @click="toggleOption(option.id)">
            <span class="play-option-number">{{ index + 1 }}</span>
            <span class="play-option-content">{{ option.content }}</span>
            <span v-if="isOptionSelected(option.id)" class="play-option-check">✓</span>
          </button>
          <label v-if="currentQuestion.allowOther" class="play-other-field">
            <span>기타 의견</span>
            <input v-model="otherAnswers[currentQuestion.id]" type="text" placeholder="직접 입력해주세요." :disabled="isSubmitted || timeExpired || isPaused" maxlength="200" />
          </label>
          <p v-if="currentQuestion.questionType === 'MULTIPLE_CHOICE' && currentQuestion.maxSelections" class="play-input-guide">최대 {{ currentQuestion.maxSelections }}개 선택 가능 · 현재 {{ selectedCount }}개 선택</p>
        </div>

        <div v-else-if="isTextType" class="play-text-answer">
          <textarea v-if="currentQuestion.questionType === 'LONG_TEXT'" v-model="answerValue" :maxlength="currentQuestion.textMaxLength || 1000" :disabled="isSubmitted || timeExpired || isPaused" placeholder="의견을 자유롭게 작성해주세요."></textarea>
          <input v-else v-model="answerValue" type="text" :maxlength="currentQuestion.textMaxLength || 100" :disabled="isSubmitted || timeExpired || isPaused" placeholder="답변을 입력해주세요." />
          <p class="play-input-guide">{{ (answerValue || '').length }} / {{ currentQuestion.textMaxLength || (currentQuestion.questionType === 'LONG_TEXT' ? 1000 : 100) }}자</p>
        </div>

        <div v-else-if="currentQuestion.questionType === 'RATING'" class="play-rating-answer">
          <div class="play-rating-options">
            <button v-for="score in (currentQuestion.scaleMax - currentQuestion.scaleMin + 1)" :key="score" type="button"
              :class="{ selected: answerValue === currentQuestion.scaleMin + score - 1 }"
              :disabled="isSubmitted || timeExpired || isPaused" @click="answerValue = currentQuestion.scaleMin + score - 1">
              {{ currentQuestion.scaleMin + score - 1 }}
            </button>
          </div>
          <div class="play-rating-labels"><span>{{ currentQuestion.scaleMinLabel || currentQuestion.scaleMin }}</span><span>{{ currentQuestion.scaleMaxLabel || currentQuestion.scaleMax }}</span></div>
        </div>

        <p v-if="validationMessage" class="play-validation-message" role="alert">{{ validationMessage }}</p>

        <button v-if="!isSubmitted && !timeExpired && !isPaused" type="button" class="primary-button play-submit-button" @click="submitAnswer">답변 제출하기 <span>→</span></button>
        <div v-else-if="timeExpired && !isSubmitted" class="play-result-notice">
          응답 시간이 종료되어 제출할 수 없습니다. 다음 질문으로 이동해주세요.
          <button type="button" class="play-expired-next-button" @click="moveToNextQuestion">다음 질문으로 이동 →</button>
        </div>
        <div v-else-if="isPaused" class="play-result-notice">진행자가 설문을 재개할 때까지 기다려주세요.</div>

        <div v-if="isSubmitted" class="play-submitted">
          <div class="play-submitted-icon">✓</div>
          <h3>답변이 제출되었습니다.</h3>
          <p>이 질문에는 다시 응답할 수 없습니다.</p>

          <div v-if="currentQuestion.options.length" class="play-poll-results">
            <div class="play-result-heading">
              <h3>현재 응답 결과</h3>
              <span>예시 데이터 · {{ totalResponses }}명 응답</span>
            </div>
            <div v-for="option in currentQuestion.options" :key="option.id" class="play-result-item">
              <div class="play-result-label"><span>{{ option.content }}</span><strong>{{ percentage(option.count) }}% · {{ option.count }}명</strong></div>
              <div class="play-result-track"><div class="play-result-bar" :style="{ width: `${percentage(option.count)}%` }"></div></div>
            </div>
          </div>
          <div v-else-if="currentQuestion.questionType === 'RATING'" class="play-poll-results">
            <div class="play-result-heading">
              <h3>척도 응답 분포</h3>
              <span>예시 데이터 · {{ totalResponses }}명 응답</span>
            </div>
            <div v-for="item in currentQuestion.ratingResults" :key="item.score" class="play-result-item">
              <div class="play-result-label"><span>{{ item.score }}점</span><strong>{{ percentage(item.count) }}% · {{ item.count }}명</strong></div>
              <div class="play-result-track"><div class="play-result-bar" :style="{ width: `${percentage(item.count)}%` }"></div></div>
            </div>
          </div>
          <div v-else class="play-result-notice">답변이 제출되었습니다. 주관식 응답은 호스트 대시보드에서 확인하도록 구성할 예정입니다.</div>
        </div>

        <div class="play-navigation">
          <button type="button" class="play-secondary-button" :disabled="currentIndex === 0" @click="goToPreviousQuestion">이전 질문</button>
          <button v-if="isSubmitted" type="button" class="primary-button play-next-button" @click="moveToNextQuestion">{{ currentIndex === questions.length - 1 ? "설문 완료" : "다음 질문" }} <span>→</span></button>
        </div>
      </section>

      <section v-else class="play-question-card play-ended-card">
        <div class="play-submitted-icon">✓</div>
        <h2>설문이 종료되었습니다.</h2>
        <p>모든 질문이 완료되었습니다. 참여해주셔서 감사합니다.</p>
        <NuxtLink to="/" class="primary-button play-home-button">홈으로 이동</NuxtLink>
      </section>

      <p class="play-footer-message">응답 내용은 이벤트 결과에 반영됩니다.</p>
    </div>
  </main>
</template>
