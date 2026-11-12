// Nuxt가 app/utils의 export를 자동으로 import 해준다

export const EVENT_STATUS = {
  DRAFT: { label: "대기 중", className: "status-waiting" },
  RUNNING: { label: "진행 중", className: "status-running" },
  PAUSED: { label: "일시정지", className: "status-paused" },
  ENDED: { label: "종료", className: "status-ended" },
};

export const eventStatusOf = (status) =>
  EVENT_STATUS[status] ?? { label: "알 수 없음", className: "status-waiting" };

export const QUESTION_TYPE_LABELS = {
  SINGLE_CHOICE: "단일 선택",
  MULTIPLE_CHOICE: "다중 선택",
  SHORT_TEXT: "단답형",
  LONG_TEXT: "장문형",
  RATING: "척도형",
};

export const questionTypeText = (type) => QUESTION_TYPE_LABELS[type] ?? "질문";

export const isChoiceKind = (type) =>
  type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";

export const isTextKind = (type) =>
  type === "SHORT_TEXT" || type === "LONG_TEXT";
