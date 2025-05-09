// 🔥 Firebase 불러오기
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// 🔥 Firestore 불러오기
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

// ✅ Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyATM2LcTO0KVLO_rqk3XnS868KpgCgfHgs",
  authDomain: "solveproblem-e26df.firebaseapp.com",
  projectId: "solveproblem-e26df",
  storageBucket: "solveproblem-e26df.firebasestorage.app",
  messagingSenderId: "984654085411",
  appId: "1:984654085411:web:5efaacb9b20e356cafe096",
  measurementId: "G-39NNY7JNNK"
};

// ✅ 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 🔍 페이지에 따라 과목명 및 콜렉션 결정
const pageName = window.location.pathname.split("/").pop();
const subjectKey = pageName.replace(".html", "");
const problemsRef = collection(db, `problems_${subjectKey}`);

let problems = [];
let currentIndex = null;
let isAdmin = false;
let editIndex = -1;

const ADMIN_PASSWORD = "1216";

// ✅ 관리자 인증
function checkAdmin() {
  const input = document.getElementById("admin-pass").value;
  if (input === ADMIN_PASSWORD) {
    isAdmin = true;
    document.getElementById("admin-section").style.display = "block";
    document.getElementById("admin-login").style.display = "none";
    renderProblems();
  } else {
    alert("비밀번호가 틀렸습니다!");
  }
}

// ✅ Firestore에서 문제 불러오기
async function loadProblemsFromFirestore() {
  const querySnapshot = await getDocs(problemsRef);
  problems = [];
  querySnapshot.forEach((docSnap) => {
    problems.push({ ...docSnap.data(), id: docSnap.id });
  });
  renderProblems();
}

// ✅ 문제 추가/수정 (Firestore 반영)
async function addProblem() {
  if (!isAdmin) return alert("관리자만 문제를 추가할 수 있습니다!");

  const title = document.getElementById("title").value.trim();
  const imageUrl = document.getElementById("image-url")?.value.trim() || "";
  const answer = document.getElementById("answer").value.trim();

  if (!title || !answer) {
    alert("제목과 정답은 반드시 입력해야 합니다!");
    return;
  }

  const problem = { title, imageUrl, answer };

  if (editIndex !== -1) {
    // 수정
    const id = problems[editIndex].id;
    const docRef = doc(db, `problems_${subjectKey}`, id);
    await setDoc(docRef, problem);
    problems[editIndex] = { ...problem, id };
    editIndex = -1;
    document.querySelector("#admin-section button").textContent = "추가";
  } else {
    // 추가
    const docRef = await addDoc(problemsRef, problem);
    problems.push({ ...problem, id: docRef.id });
  }

  // 입력창 초기화
  document.getElementById("title").value = "";
  if (document.getElementById("image-url")) document.getElementById("image-url").value = "";
  document.getElementById("answer").value = "";

  renderProblems();
}

// ✅ 문제 삭제 (Firestore 반영)
async function deleteProblem(index) {
  const id = problems[index].id;
  const confirmDelete = confirm(`'${problems[index].title}' 문제를 삭제할까요?`);
  if (!confirmDelete) return;

  await deleteDoc(doc(db, `problems_${subjectKey}`, id));
  problems.splice(index, 1);
  renderProblems();
}

// ✅ 문제 목록 렌더링
function renderProblems() {
  const list = document.getElementById("problems");
  list.innerHTML = "";

  problems.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.title;
    li.onclick = () => showProblem(i);

    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "삭제";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        deleteProblem(i);
      };

      const editBtn = document.createElement("button");
      editBtn.textContent = "수정";
      editBtn.style.marginLeft = "5px";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        document.getElementById("title").value = p.title;
        if (document.getElementById("image-url")) document.getElementById("image-url").value = p.imageUrl;
        document.getElementById("answer").value = p.answer;
        editIndex = i;
        document.querySelector("#admin-section button").textContent = "수정 완료";
      };

      li.appendChild(delBtn);
      li.appendChild(editBtn);
    }

    list.appendChild(li);
  });
}

// ✅ 문제 상세 보기
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

// ✅ 정답 확인
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

window.onload = loadProblemsFromFirestore;
