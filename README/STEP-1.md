# 1. Tạo repo mới trên git

# 2. Trên máy local thực hiện remote git về repo này

## 2.1 Kiểm tra remote hiện tại đang trỏ đi đâu

```bash
git remote -v
```

> Kiểm tra xem đã remote đúng repo chưa?

## 2.2 Nếu remote đang trỏ sai repo -> đổi lại origin

```bash
git remote set-url origin https://github.com/dangtoan2205/CI-CD-Offboard-checklist-on-vm-GCP.git
```

> Kiểm tra lại:

```bash
git remote -v
```

> Cách khác (xóa rồi add lại)

```bash
git remote remove origin
git remote add origin https://github.com/dangtoan2205/CI-CD-Offboard-checklist-on-vm-GCP.git
```

## 2.3 Tạo nhánh `dev` & đẩy code ban đầu

> Kiểm tra nhánh hiện tại

```bash
git branch
```

> Tạo nhánh `dev`

```bash
git checkout -b dev
```

> Push code ban đầu

```bash
git add .
git commit -m "init: initial project setup for CI/CD"
git push -u origin dev
```

## 3. Tạo nhánh `main` (nhưng không làm việc trực tiếp)

```
git checkout -b main
git push -u origin main
```

📌 KHÔNG code trên main, chỉ dùng để merge.

## 4. Cấu hình bảo vệ nhánh `main` (BẮT BUỘC)

**GitHub → Repo → Settings → Branches**

> Add branch protection rule
