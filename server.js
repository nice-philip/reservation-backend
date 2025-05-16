const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 8080;

// ✅ MongoDB 연결
mongoose.connect(
    'mongodb+srv://kmat0:ap6a96XKSREgbz1J@cluster0.emtvkam.mongodb.net/beauty-reservation?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    console.log('✅ MongoDB 연결 성공');
}).catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
});

// ✅ 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 정적 파일 제공

// ✅ 예약 스키마
const reservationSchema = new mongoose.Schema({
    category: String,
    name: String,
    age: Number,
    gender: String,
    email: String,
    date: String,
    time: String,
    mainRequest: String,
    note: String,
    memberKey: String, // 🔸 회원 확인용 키 추가
    savedAt: { type: Date, default: Date.now }
});
const Reservation = mongoose.model('Reservation', reservationSchema, '시술예약');

// ✅ 예약 저장
app.post('/api/reservations', async(req, res) => {
    try {
        const newReservation = new Reservation(req.body);
        await newReservation.save();
        res.status(200).json({ message: '예약 저장 완료' });
    } catch (err) {
        res.status(500).json({ error: '서버 에러', detail: err.message });
    }
});

// ✅ 예약 전체 조회 (필터링은 클라이언트에서 처리)
app.get('/api/reservations', async(req, res) => {
    try {
        const list = await Reservation.find().sort({ savedAt: -1 });
        res.status(200).json(list);
    } catch (err) {
        res.status(500).json({ error: '조회 실패' });
    }
});

// ✅ 예약 수정
app.put('/api/reservations/:id', async(req, res) => {
    try {
        const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: '예약 없음' });
        res.status(200).json({ message: '예약 수정 완료', data: updated });
    } catch (err) {
        res.status(500).json({ error: '수정 실패' });
    }
});

// ✅ 예약 삭제
app.delete('/api/reservations/:id', async(req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
        res.status(500).json({ error: '삭제 실패', detail: err.message });
    }
});


// ✅ 서버 실행
app.listen(port, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});