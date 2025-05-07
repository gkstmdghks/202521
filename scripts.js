let problems = [];
let currentIndex = null;
let isAdmin = false;

// 🔍 현재 HTML 파일 이름 기반으로 과목 이름 추출해서 STORAGE_KEY 지정
const pageName = window.location.pathname.split("/").pop();
const subjectKey = pageName.replace(".html", ""); // 예: 'math1'
const STORAGE_KEY = `problems_${subjectKey}`;

// 관리자 비밀번호 (보안용이 아님, 클라이언트 공개임)
const ADMIN_PASSWORD = "1234";

// 관리자 로그인 함수
function checkAdmin() {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    isAdmin = true;
    document.getElementById("admin-section").style.display = "block";
    document.getElementById("admin-login").style.display = "none";
  } else {
    alert("비밀번호가 틀렸습니다!");
  }
}

// 문제 저장
function saveProblems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  renderProblems();
}

// 문제 불러오기
function loadProblems() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) problems = JSON.parse(saved);
  renderProblems();
}

// 문제 추가
function addProblem() {
  if (!isAdmin) return alert("관리자만 문제를 추가할 수 있습니다!");

  const title = document.getElementById("title").value.trim();
  const imageUrl = document.getElementById("image-url")?.value.trim() || "";
  const answer = document.getElementById("answer").value.trim();

  if (title && answer) {
    problems.push({ title, imageUrl, answer });
    saveProblems();
    document.getElementById("title").value = "";
    if (document.getElementById("image-url")) document.getElementById("image-url").value = "";
    document.getElementById("answer").value = "";
  } else {
    alert("제목과 정답은 반드시 입력해야 합니다!");
  }
}

// 문제 목록 렌더링
function renderProblems() {
  const list = document.getElementById("problems");
  list.innerHTML = "";

  problems.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.title;
    li.onclick = () => showProblem(i);
    list.appendChild(li);
  });
}

// 문제 보여주기
function showProblem(index) {
  currentIndex = index;
  const p = problems[index];
  document.getElementById("solve-title").textContent = p.title;
  const img = document.getElementById("solve-image");

  if (p.imageUrl) {
    img.src = p.imageUrl;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  document.getElementById("solve-section").style.display = "block";
  document.getElementById("user-answer").value = "";
  document.getElementById("result").textContent = "";
}

// 정답 확인
function checkAnswer() {
  const userInput = document.getElementById("user-answer").value.trim().toLowerCase();
  const correct = problems[currentIndex].answer.trim().toLowerCase();
  const result = document.getElementById("result");

  if (userInput === correct) {
    result.textContent = "✅ 정답입니다!";
    result.style.color = "green";
  } else {
    result.textContent = "❌ 오답입니다!";
    result.style.color = "red";
  }
}

window.onload = loadProblems;
