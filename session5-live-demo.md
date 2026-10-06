# 세션 5 라이브 수정 시연: TOP 5 카드

대시보드에 "이번 달 출고 많은 부품 TOP 5" 카드를 Claude Code가 그 자리에서 만드는 시연이다.
전체 진행 흐름은 `lecture-runbook.md` 세션 5 절을 따른다. 이 문서는 시연에 필요한 명령과 주의점만 모았다.

## 브랜치와 화면

| 브랜치 | 내용 | TOP 5 카드 |
|---|---|---|
| `main` | 강의 시작 상태. 배포 사이트와 같은 코드 | 없음 |
| `demo/top5` | 시연 실패 대비 완성본 (이 PC에만 있음) | 있음 |

| 보는 곳 | 보이는 내용 |
|---|---|
| 배포 사이트 `https://cha-ssem.github.io/samkwang-inventory/` | GitHub `main`에 올라간 코드. 브랜치를 바꿔도 변하지 않는다 |
| 로컬 화면 `http://localhost:5173` (`npm run dev`) | 지금 이 PC에서 체크아웃한 브랜치 |

- `git checkout`은 이 PC의 파일만 바꾼다. GitHub에는 아무것도 보내지 않는다.
- 배포는 `main`에 push할 때만 일어난다. `demo/top5`는 push해도 배포되지 않는다.
- `demo/top5`를 `main`에 합치지 않는다. 합치면 참석자가 보는 사이트에 카드가 생겨서 "없던 기능을 만드는" 시연이 의미가 없어진다.
- 그래서 완성본은 **`git checkout demo/top5` + `npm run dev` → `localhost:5173`**으로만 볼 수 있다.

## 미리 완성본 확인하기 (리허설)

`main`에 커밋 안 된 변경이 없으면 `git stash` 없이 바로 전환해도 된다.

```bash
cd /Users/chamac/Documents/Enterprise-WEB/inventory-app
git status              # main, 변경 없음 확인
git checkout demo/top5
npm run dev             # http://localhost:5173 → 대시보드에 TOP 5 카드
```

다 보면 `Ctrl+C`로 서버를 끄고 `git checkout main`으로 돌아온다.

- `demo/top5`에는 `npm run instructor-guide` / `handout` / `infographic` 명령이 없다. 자료를 다시 만들 때는 `main`에서 실행한다.
- 탭 제목은 두 브랜치 모두 `부품 입출고관리`이다. 회사 이름은 2026-10-06에 뺐다.

## 시연 순서

1. `main`인지, 변경이 없는지 확인한다.
   ```bash
   git checkout main
   git status
   ```
2. 터미널 1에서 `npm run dev`를 켜고 `localhost:5173`을 연다. **카드가 없는 화면**을 먼저 보여 준다.
3. 터미널 2에서 **`inventory-app` 폴더로 가서 새 Claude Code 세션**을 열고 그대로 붙여넣는다.
   ```
   대시보드에 "이번 달 출고 많은 부품 TOP 5" 카드를 추가해줘.
   품번, 품명, 이번 달 출고 수량을 보여주고, 누르면 그 부품의 이력으로 가게.
   테스트도 같이 만들고, 다 되면 빌드해서 확인할 수 있게 해줘.
   ```
4. 보여줄 장면
   - Claude Code가 관련 파일을 찾아 읽는 과정 ("기존 코드를 먼저 이해한다")
   - 테스트를 먼저 쓰고, 기능을 만들고, 테스트가 통과하는 과정
   - 브라우저 새로고침 → 대시보드에 TOP 5 카드
5. 이어서 한마디 더 요청한다.
   ```
   수량 옆에 단위(EA, BOX 등)도 붙여줘
   ```

### 새 세션을 `inventory-app`에서 여는 이유

`Enterprise-WEB` 폴더에서 열면 Claude가 "`demo/top5`에 완성본이 있다"는 메모를 읽을 수 있다. 그러면 새로 만들지 않고 완성본 브랜치 얘기를 꺼내서 시연이 어색해진다.
리허설에서도 브랜치 얘기가 나오면 요청 앞에 `지금 main 코드에 새로 만들어줘`를 붙인다.

## 7분이 넘을 때: 완성본으로 전환

`npm run dev`는 켜 둔 채로 진행한다.

```bash
git stash -u            # 1. 시연 중 Claude가 만든 변경을 임시로 치워 둠
git checkout demo/top5  # 2. 완성본으로 전환 → 대시보드에 TOP 5 카드가 나타남
git checkout main       # 3. 다 보여준 뒤 원래 상태로 복귀 → TOP 5 카드가 사라짐
git stash drop          # 4. 치워 둔 시연 변경 버리기
```

- 1번을 빼먹으면 2번 전환이 거부되거나, 시연 중 바뀐 파일이 완성본에 섞인다.
- 브랜치를 바꾸면 화면이 저절로 바뀐다. 안 바뀌면 새로고침한다.
- 4번은 미뤄도 된다. 시연 변경을 다시 보려면 `git stash pop`으로 되살린다.
- 어느 단계도 `main`이나 배포 사이트를 바꾸지 않는다.
- 인터넷이 끊기면 녹화 영상으로 대체한다.

AI가 매번 똑같이 만들지는 않는다는 점도 자연스러운 설명거리다.

## 시연이 잘 끝났을 때: 정리

Claude가 만든 변경이 `main`에 커밋 안 된 상태로 남는다. **커밋하지 않는다.**

```bash
git stash -u
git stash drop
git status              # main, 변경 없음 확인
```

## 강의 전 점검

- [ ] `git branch`에 `demo/top5`가 있다
- [ ] `demo/top5`로 전환해 카드가 보이는지 한 번 확인하고 `main`으로 돌아왔다
- [ ] `main`에 커밋 안 된 변경이 없다 (`git status`)
- [ ] `inventory-app` 폴더에서 새 세션으로 요청문을 리허설했다
- [ ] (선택) `demo/top5`를 GitHub에 백업했다: `git push -u origin demo/top5` (배포되지 않음)
