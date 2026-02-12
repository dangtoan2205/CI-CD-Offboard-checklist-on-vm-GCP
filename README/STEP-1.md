
-----
# 0. Tạo Organization (làm ngay từ đầu)
## 0.1 Tạo Organization

**GitHub → Your organizations → New organization**
- Chọn **My personal account** (nếu lab/cá nhân)
- Đặt tên org (unique) ví dụ: `Wayne-DevOps`
- Không cần tick Copilot Business (trừ khi bạn muốn dùng)

✅ Có thể Skip bước “Add organization members” lúc tạo org.

## 0.2 (Tuỳ chọn) Upload avatar org

**Organization → Settings → General → Profile picture → Upload new picture**

📌 Lưu ý:
- Upload xong phải Save changes
- Nếu chưa thấy cập nhật: Ctrl + F5 (cache)

# 1. Tạo repo mới trong Organization (khuyến nghị)

**Organization → Repositories → New**

- Owner: chọn `Wayne-DevOps`
- Repo name: `CI-CD-Offboard-checklist-on-vm-GCP`
- Chọn **Private** (khuyến nghị)
- Initialize: có/không tuỳ bạn (nếu local đã có code thì không cần)

📌 Lưu ý:

- Tạo repo trong org để dùng được **Teams + Restrict push** to main sau này.

# 2. Trên máy local, set remote về repo trong Organization

## 2.1 Kiểm tra remote hiện tại đang trỏ đi đâu

```
git remote -v
```

> Kiểm tra xem origin đã đúng repo trong Organization chưa?

## 2.2 Nếu remote đang trỏ sai repo -> đổi lại origin

✅ Đổi origin về repo trong org (thay `Wayne-DevOps` bằng org của bạn):

```
git remote set-url origin https://github.com/Wayne-DevOps/CI-CD-Offboard-checklist-on-vm-GCP.git
```

> Kiểm tra lại:

```
git remote -v
```

> Cách khác (xóa rồi add lại)

```
git remote remove origin
git remote add origin https://github.com/Wayne-DevOps/CI-CD-Offboard-checklist-on-vm-GCP.git
```

📌 Lưu ý:
- Nếu bạn dùng SSH thì set URL dạng `git@github.com:Wayne-DevOps/....git`

# 3. Tạo nhánh dev & đẩy code ban đầu

> Kiểm tra nhánh hiện tại

```
git branch
```

> Tạo nhánh dev

```
git checkout -b dev
```

> Push code ban đầu

```
git add .
git commit -m "init: initial project setup for CI/CD"
git push -u origin dev
```

📌 Lưu ý:

- `dev` là nhánh làm việc chính của dev team.

# 4. Tạo nhánh main (KHÔNG làm việc trực tiếp)

```
git checkout -b main
git push -u origin main
```

📌 Quy ước:
- ❌ Không code trên main
- ✅ main chỉ dùng để merge PR từ dev hoặc release

# 5. Thiết lập default branch

**Repo → Settings → Branches → Default branch**

- Set **default branch** = `dev`

📌 Lý do:
- Khi collaborator clone repo, họ làm việc mặc định trên `dev`
- Giảm rủi ro thao tác nhầm vào `main`

# 6. Cấu hình bảo vệ nhánh `main` (BẮT BUỘC)

**Repo → Settings → Branches → Branch protection rules → Add classic branch protection rule**

## 6.1 Rule cho `main`

- Branch name pattern: `main`

Tick:

- ✅ Require a pull request before merging
- ✅ Require approvals (**1**)
- ✅ Require status checks to pass before merging (nếu có CI)
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

❌ Không tick:
- Allow force pushes
- Allow deletions
- Lock branch (trừ khi muốn “đóng băng”)

## 7. (Quan trọng) Restrict ai được push lên `main` (chỉ có ở Organization)

> Sau khi repo nằm trong Organization, bạn sẽ thấy tuỳ chọn này.

Trong rule của `main`:
- ✅ **Restrict who can push to matching branches**
- Add người được push/merge (thường là bạn / admin)

📌 Kết quả:

- Dev **không push được main**
- Dev chỉ tạo PR, bạn review/merge

# 8. Tạo Team và cấp quyền cho user khác theo chuẩn
## 8.1 Tạo Team Dev

**Organization → Teams → New team**
- Team name: `Dev`

Add member: `vianhcodon20`

## 8.2 Gán quyền team vào repo

**Repo → Settings → Collaborators and teams → Add teams**

- Add team: `Dev`
- Permission: **Write**

📌 Write cho phép:
- Clone repo
- Tạo branch
- Push branch của họ
- Tạo Pull Request

# 9. Cấu hình quyền merge vào `main`

Có 2 cách chuẩn (chọn 1):

**Cách A (khuyên dùng): Chỉ bạn merge main**
- Team Dev: Write
- Main branch restrict push: chỉ add bạn
- PR từ dev → bạn review/merge
- ✅ An toàn, đúng mô hình thực tế.

**Cách B: Có người khác được merge main**
- Add user đó vào **team Maintainers** hoặc cho quyền **Maintain**
- Và add họ trong danh sách “Restrict who can push…”

# 10. Flow làm việc chuẩn cho Dev
## 10.1 Dev tạo branch từ dev

```
git checkout dev
git pull origin dev
git checkout -b feature/<ten-task>
```

## 10.2 Dev push branch và mở PR về dev

```
git push -u origin feature/<ten-task>
```

- Base branch: `dev`
- Compare: `feature/<ten-task>`

## 10.3 Khi dev xong release → tạo PR từ dev sang main

- Base: `main`
- Compare: `dev`
- Người quản lý review + merge

# 11. Lưu ý quan trọng (tránh lỗi phổ biến)

- ✅ Default branch nên là dev
- ✅ Dev chỉ làm việc trên dev/feature/*
- ✅ main luôn có branch protection + status check
- ✅ Không cấp Admin cho dev trừ khi bất khả kháng
- ✅ User phải **accept invitation** thì mới thấy repo (nếu thấy trống/không thấy repo thường do chưa accept)