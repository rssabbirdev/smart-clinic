'use client';

import { useState, useEffect } from 'react';

export default function LandingPage() {
	// ——— original state ———
	const [studentId, setStudentId] = useState('');
	const [studentInfo, setStudentInfo] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showManualForm, setShowManualForm] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showAlreadyInQueueModal, setShowAlreadyInQueueModal] =
		useState(false);
	const [queueInfo, setQueueInfo] = useState<any>(null);
	const [countdown, setCountdown] = useState(30);

	const [manualForm, setManualForm] = useState({
		name: '',
		class: '',
		mobile: '',
	});

	const symptoms = [
		{ id: 'headache', label: 'Headache', icon: '🧠' },
		{ id: 'fever', label: 'Fever', icon: '🌡️' },
		{ id: 'cough', label: 'Cough', icon: '😷' },
		{ id: 'stomach', label: 'Stomach Pain', icon: '🫃' },
		{ id: 'injury', label: 'Injury', icon: '🩹' },
		{ id: 'dizziness', label: 'Dizziness', icon: '💫' },
		{ id: 'others', label: 'Others (Not Included)', icon: '📝' },
	];

	const severityLevels = ['Low', 'Medium', 'High', 'Emergency'];
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
	const [severity, setSeverity] = useState('');
	const [emergencyFlag, setEmergencyFlag] = useState(false);
	
	// Custom symptoms state
	const [showCustomSymptomsModal, setShowCustomSymptomsModal] = useState(false);
	const [customSymptoms, setCustomSymptoms] = useState('');

	// ——— NEW: UI-only step state ———
	const [step, setStep] = useState(1);

	// Countdown effect (unchanged)
	useEffect(() => {
		if ((showSuccessModal || showAlreadyInQueueModal) && countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		} else if (
			(showSuccessModal || showAlreadyInQueueModal) &&
			countdown === 0
		) {
			handleReturnHome();
		}
	}, [showSuccessModal, showAlreadyInQueueModal, countdown]);

	// Handlers (unchanged)
	const handleSymptomToggle = (symptomId: string) => {
		if (symptomId === 'others') {
			setShowCustomSymptomsModal(true);
			return;
		}
		
		setSelectedSymptoms((prev) =>
			prev.includes(symptomId)
				? prev.filter((s) => s !== symptomId)
				: [...prev, symptomId]
		);
	};

	const handleSeveritySelect = (level: string) => {
		setSeverity(level);
	};
	
	const handleCustomSymptomsSubmit = () => {
		if (customSymptoms.trim()) {
			// Add custom symptoms to selected symptoms
			setSelectedSymptoms(prev => [...prev, 'custom']);
			setShowCustomSymptomsModal(false);
			// Don't clear customSymptoms - we need it for display and API
		}
	};

	const handleStudentIdSearch = async () => {
		if (!studentId.trim()) return;
		setIsLoading(true);
		
		try {
			// Check if they're currently in queue
			const queueResponse = await fetch(
				`/api/queue/position?studentId=${studentId}`
			);
			const queueData = await queueResponse.json();

			if (queueData.success) {
				setQueueInfo({
					...queueData.currentVisit,
					queueNumber: queueData.queueNumber,
					totalWaiting: queueData.totalWaiting,
				});
				setShowAlreadyInQueueModal(true);
				setCountdown(30);
				setIsLoading(false);
				return;
			}

			// Get student info from database
			const response = await fetch(
				`/api/students/search?studentId=${studentId}`
			);
			const data = await response.json();

			if (data.success && data.student) {
				setStudentInfo(data.student);
				setShowManualForm(false);
			} else {
				setShowManualForm(true);
				setStudentInfo(null);
			}
		} catch (error) {
			setShowManualForm(true);
			setStudentInfo(null);
		} finally {
			setIsLoading(false);
		}
	};

	const handleManualSubmit = () => {
		if (manualForm.name.trim() && manualForm.class.trim()) {
			setStudentInfo({
				studentId: studentId || 'GUEST',
				name: manualForm.name,
				class: manualForm.class,
				mobile: manualForm.mobile,
				isGuest: true,
			});
			setShowManualForm(false);
		}
	};

	const handleCheckIn = async () => {
		if (!studentInfo || selectedSymptoms.length === 0 || !severity) {
			alert('Please complete all required fields');
			return;
		}

		// Special validation for custom symptoms
		if (selectedSymptoms.includes('custom') && !customSymptoms.trim()) {
			alert('Please describe your custom symptom');
			return;
		}

		// Set loading state
		setIsLoading(true);

		try {
			// Prepare symptoms data - include custom symptoms if selected
			let symptomsData = [...selectedSymptoms];
			if (selectedSymptoms.includes('custom')) {
				symptomsData = selectedSymptoms.filter(s => s !== 'custom');
				symptomsData.push(`Custom: ${customSymptoms}`);
			}

			const response = await fetch('/api/check-in', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					studentId: studentInfo.studentId,
					name: studentInfo.name,
					class: studentInfo.class,
					mobile: studentInfo.mobile,
					symptoms: symptomsData,
					severity,
					emergencyFlag,
					isGuest: studentInfo.isGuest || false,
				}),
			});

			const data = await response.json();
			if (data.success) {
				const queueResponse = await fetch(
					`/api/queue/position?studentId=${studentInfo.studentId}`
				);
				const queueData = await queueResponse.json();

				if (queueData.success) {
					setQueueInfo({
						...data.data,
						queueNumber: queueData.queueNumber,
						totalWaiting: queueData.totalWaiting,
					});
					setShowSuccessModal(true);
					setCountdown(30);
				}
			} else if (data.error === 'already_in_queue') {
				const queueResponse = await fetch(
					`/api/queue/position?studentId=${studentInfo.studentId}`
				);
				const queueData = await queueResponse.json();

				if (queueData.success) {
					setQueueInfo({
						...data.existingVisit,
						queueNumber: queueData.queueNumber,
						totalWaiting: queueData.totalWaiting,
					});
					setShowAlreadyInQueueModal(true);
					setCountdown(30);
				}
			} else {
				alert(data.error || 'Check-in failed');
			}
		} catch (error) {
			alert('Check-in failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmergency = async () => {
		try {
			const response = await fetch('/api/queue/emergency', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ studentId: queueInfo.studentId }),
			});

			const data = await response.json();
			if (data.success) {
				alert('Your case has been marked as emergency!');
				handleReturnHome();
			} else {
				alert(data.error || 'Failed to mark as emergency');
			}
		} catch (error) {
			alert('Failed to mark as emergency. Please try again.');
		}
	};

	const handleReturnHome = () => {
		setShowSuccessModal(false);
		setShowAlreadyInQueueModal(false);
		setQueueInfo(null);
		setStudentId('');
		setStudentInfo(null);
		setShowManualForm(false);
		setSelectedSymptoms([]);
		setSeverity('');
		setEmergencyFlag(false);
		setManualForm({ name: '', class: '', mobile: '' });
		setCustomSymptoms('');
		setCountdown(30);
		setStep(1); // reset UI flow
	};

	const canCheckIn = () => {
		// Check if we have basic requirements
		if (!studentInfo || !severity || isLoading) return false;
		
		// Check if we have symptoms (including custom)
		if (selectedSymptoms.length === 0) return false;
		
		// If custom symptom is selected, make sure we have the description
		if (selectedSymptoms.includes('custom') && !customSymptoms.trim()) return false;
		
		// Allow check-in if it's a new student OR if they can re-check-in (expired visit)
		return true;
	};

	// Custom Symptoms Modal
	if (showCustomSymptomsModal) {
		return (
			<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
				<div className='bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'>
					<div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 text-center'>
						<div className='text-6xl mb-4'>📝</div>
						<h2 className='text-2xl font-bold'>
							Describe Your Symptom
						</h2>
						<p className='text-purple-100'>
							Please tell us what you're experiencing
						</p>
					</div>
					
					<div className='p-6 space-y-6'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								What is the symptom?
							</label>
							<textarea
								value={customSymptoms}
								onChange={(e) => setCustomSymptoms(e.target.value)}
								placeholder='Describe your symptom in detail...'
								className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none'
								rows={3}
							/>
						</div>
						
						<div className='flex gap-3'>
							<button
								onClick={() => setShowCustomSymptomsModal(false)}
								className='w-1/3 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors'
							>
								Cancel
							</button>
							<button
								onClick={handleCustomSymptomsSubmit}
								disabled={!customSymptoms.trim()}
								className='w-2/3 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors'
							>
								Submit
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ——— Modals (unchanged) ———
	if (showSuccessModal && queueInfo) {
		return (
			<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
				<div className='bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'>
					<div className='bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center'>
						<div className='text-6xl mb-4'>✅</div>
						<h2 className='text-2xl font-bold'>
							Check-in Successful!
						</h2>
						<p className='text-green-100'>
							You have been added to the queue
						</p>
					</div>
					<div className='p-6'>
						<div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6'>
							<h3 className='text-lg font-semibold text-blue-800 mb-3 text-center'>
								Queue Information
							</h3>
							<div className='space-y-3'>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>Name:</span>
									<span className='font-semibold'>
										{studentInfo.name}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										Student ID:
									</span>
									<span className='font-semibold'>
										{studentInfo.studentId}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										Queue Number:
									</span>
									<span className='text-2xl font-bold text-blue-600'>
										#{queueInfo.queueNumber}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										People Ahead:
									</span>
									<span className='font-semibold'>
										{queueInfo.queueNumber - 1}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										Priority:
									</span>
									<span className='font-semibold capitalize'>
										{queueInfo.priority}
									</span>
								</div>
								{emergencyFlag && (
									<div className='bg-red-100 border border-red-200 rounded-lg p-3 text-center'>
										<span className='text-red-800 font-semibold'>
											🚨 Emergency Case
										</span>
									</div>
								)}
							</div>
						</div>

						<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
							<p className='text-yellow-800 text-center font-medium'>
								Please wait in the waiting area. Your name will
								be called when it's your turn.
							</p>
						</div>

						<button
							onClick={handleReturnHome}
							className='w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors mb-3'
						>
							Return Home
						</button>

						<p className='text-center text-sm text-gray-500'>
							Auto-redirecting in {countdown} seconds...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (showAlreadyInQueueModal && queueInfo) {
		return (
			<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
				<div className='bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'>
					<div className='bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center'>
						<div className='text-6xl mb-4'>⚠️</div>
						<h2 className='text-2xl font-bold'>
							Already in Queue!
						</h2>
						<p className='text-orange-100'>
							You are already registered
						</p>
					</div>

					<div className='p-6'>
						<div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6'>
							<h3 className='text-lg font-semibold text-blue-800 mb-3 text-center'>
								Current Queue Status
							</h3>
							<div className='space-y-3'>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>Name:</span>
									<span className='font-semibold'>
										{queueInfo.name}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										Student ID:
									</span>
									<span className='font-semibold'>
										{queueInfo.studentId}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										Queue Number:
									</span>
									<span className='text-2xl font-bold text-blue-600'>
										#{queueInfo.queueNumber}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										People Ahead:
									</span>
									<span className='font-semibold'>
										{queueInfo.queueNumber - 1}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>
										Priority:
									</span>
									<span className='font-semibold capitalize'>
										{queueInfo.priority}
									</span>
								</div>
								{queueInfo.emergencyFlag && (
									<div className='bg-red-100 border border-red-200 rounded-lg p-3 text-center'>
										<span className='text-red-800 font-semibold'>
											🚨 Emergency Case
										</span>
									</div>
								)}
							</div>
						</div>

						<div className='space-y-3 mb-6'>
							<button
								onClick={handleEmergency}
								className='w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors'
							>
								🚨 Mark as Emergency
							</button>

							<button
								onClick={handleReturnHome}
								className='w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors'
							>
								Return Home
							</button>
						</div>

						<p className='text-center text-sm text-gray-500'>
							Auto-redirecting in {countdown} seconds...
						</p>
					</div>
				</div>
			</div>
		);
	}

	// ——— Redesigned main UI (kiosk-style) ———
	return (
		<div className='min-h-screen bg-gray-100 flex items-center justify-center p-6 relative'>
			{/* Floating Staff Login Button */}
			<a
				href="/login"
				className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40"
				title="Staff Login"
			>
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			</a>

			<div className='bg-white shadow-lg rounded-2xl w-full max-w-md p-8 text-center'>
				{/* Top brand like the kiosk */}
				<div className='mb-8'>
					<div className='mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-3xl mb-4 shadow-lg'>
						🏥
					</div>
					<h1 className='text-3xl font-bold text-gray-800'>Welcome to SmartClinic</h1>
					<p className='text-gray-600 mt-2'>Student Health Check-in System</p>
					
					{/* Step Indicator */}
					<div className='flex justify-center mt-6'>
						<div className='flex items-center space-x-2'>
							{[1, 2, 3, 4].map((stepNumber) => (
								<div
									key={stepNumber}
									className={`w-3 h-3 rounded-full transition-all duration-300 ${
										stepNumber === step
											? 'bg-blue-600 scale-125'
											: stepNumber < step
											? 'bg-green-500'
											: 'bg-gray-300'
									}`}
								/>
							))}
						</div>
					</div>
				</div>

				{/* STEP 1 — ID */}
				{step === 1 && (
					<>
						<h2 className='text-xl font-semibold text-gray-800'>
							Enter Your Student ID
						</h2>
						<p className='text-gray-600 mt-2 mb-4'>
							Please enter your student ID to begin check-in
						</p>
						<input
							type='text'
							value={studentId}
							onChange={(e) => setStudentId(e.target.value)}
							placeholder='Enter Student ID'
							className='w-full mt-4 px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-medium'
							onKeyPress={(e) => e.key === 'Enter' && studentId.trim() && handleStudentIdSearch()}
						/>
						<button
							onClick={async () => {
								await handleStudentIdSearch();
								// if a modal opened, it will take over via early return above
								setStep(2);
							}}
							disabled={!studentId.trim() || isLoading}
							className='w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200'
						>
							{isLoading ? (
								<div className="flex items-center justify-center gap-2">
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
									Searching...
								</div>
							) : (
								'Continue'
							)}
						</button>
					</>
				)}

				{/* STEP 2 — Confirm / Manual */}
				{step === 2 && (
					<>
						<h2 className='text-xl font-semibold mb-4'>
							Confirm your details
						</h2>



						{studentInfo && (
							<div className='text-left bg-green-50 border border-green-200 rounded-xl p-4'>
								<div className='flex justify-between py-1'>
									<span className='text-gray-600'>Name</span>
									<span className='font-medium'>
										{studentInfo.name}
									</span>
								</div>
								<div className='flex justify-between py-1'>
									<span className='text-gray-600'>
										Student ID
									</span>
									<span className='font-medium'>
										{studentInfo.studentId}
									</span>
								</div>
								<div className='flex justify-between py-1'>
									<span className='text-gray-600'>Class</span>
									<span className='font-medium'>
										{studentInfo.class}
									</span>
								</div>
								{studentInfo.mobile && (
									<div className='flex justify-between py-1'>
										<span className='text-gray-600'>
											Mobile
										</span>
										<span className='font-medium'>
											{studentInfo.mobile}
										</span>
									</div>
								)}
							</div>
						)}

						{showManualForm && (
							<div className='space-y-4 text-left bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5 mb-4'>
								<h3 className='font-semibold text-yellow-800 mb-3 text-center'>📝 Manual Entry Required</h3>
								<div className='space-y-3'>
									<input
										type='text'
										value={manualForm.name}
										onChange={(e) =>
											setManualForm((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										placeholder='Full Name'
										className='w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
									/>
									<input
										type='text'
										value={manualForm.class}
										onChange={(e) =>
											setManualForm((prev) => ({
												...prev,
												class: e.target.value,
											}))
										}
										placeholder='Class/Year'
										className='w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
									/>
									<input
										type='tel'
										value={manualForm.mobile}
										onChange={(e) =>
											setManualForm((prev) => ({
												...prev,
												mobile: e.target.value,
											}))
										}
										placeholder='Mobile (optional)'
										className='w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
									/>
									<button
										onClick={handleManualSubmit}
										disabled={
											!manualForm.name.trim() ||
											!manualForm.class.trim()
										}
										className='w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-semibold transition-colors duration-200'
									>
										Save Details
									</button>
								</div>
							</div>
						)}

						<div className='flex gap-3 mt-6'>
							<button
								onClick={() => setStep(1)}
								className='w-1/3 py-4 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200'
							>
								← Back
							</button>
							<button
								onClick={() => setStep(3)}
								disabled={!studentInfo}
								className='w-2/3 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200'
							>
								Continue →
							</button>
						</div>
					</>
				)}

				{/* STEP 3 — Symptoms */}
				{step === 3 && (
					<>
						<h2 className='text-xl font-semibold text-gray-800'>
							Select Your Symptoms
						</h2>
						<p className='text-gray-600 mt-2 mb-6'>
							Choose all symptoms that apply to you
						</p>
						<div className='grid grid-cols-2 gap-4'>
							{symptoms.map((s) => {
								const active = selectedSymptoms.includes(s.id);
								return (
									<button
										key={s.id}
										onClick={() =>
											handleSymptomToggle(s.id)
										}
										className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
											active
												? 'bg-blue-600 text-white border-blue-600 shadow-lg'
												: 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
										}`}
									>
										<div className='text-2xl mb-2'>{s.icon}</div>
										<div className='font-medium text-sm'>
											{s.label}
										</div>
									</button>
								);
							})}
						</div>
						
						{/* Display selected custom symptoms if any */}
						{selectedSymptoms.includes('custom') && (
							<div className='mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl'>
								<h4 className='font-semibold text-purple-800 mb-2 text-center'>📝 Custom Symptom</h4>
								<div className='space-y-2 text-sm'>
									<div>
										<strong className='text-purple-700'>Symptom:</strong>
										<p className='text-purple-600 mt-1'>{customSymptoms}</p>
									</div>
								</div>
							</div>
						)}

						<div className='flex gap-3 mt-6'>
							<button
								onClick={() => setStep(2)}
								className='w-1/3 py-4 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200'
							>
								← Back
							</button>
							<button
								onClick={() => setStep(4)}
								disabled={selectedSymptoms.length === 0}
								className='w-2/3 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200'
							>
								Continue →
							</button>
						</div>
					</>
				)}

				{/* STEP 4 — Severity + Emergency + Check In */}
				{step === 4 && (
					<>
						<h2 className='text-xl font-semibold text-gray-800'>Symptom Severity</h2>
						<p className='text-gray-600 mt-2 mb-6'>
							How would you rate the severity of your symptoms?
						</p>

						<div className='space-y-3'>
							{severityLevels.map((level) => {
								const isSelected = severity === level;
								const getLevelColor = (level: string) => {
									switch (level) {
										case 'Emergency': return 'border-red-500 hover:border-red-600 text-red-600 hover:text-red-700';
										case 'High': return 'border-orange-500 hover:border-orange-600 text-orange-600 hover:text-orange-700';
										case 'Medium': return 'border-yellow-500 hover:border-yellow-600 text-yellow-600 hover:text-yellow-700';
										case 'Low': return 'border-green-500 hover:border-green-600 text-green-600 hover:text-green-700';
										default: return 'border-gray-300 hover:border-blue-400 text-gray-700';
									}
								};
								
								return (
									<button
										key={level}
										onClick={() => handleSeveritySelect(level)}
										className={`w-full py-4 rounded-xl border-2 transition-all duration-200 font-medium text-lg ${
											isSelected
												? 'bg-blue-600 text-white border-blue-600 shadow-lg'
												: `bg-white hover:bg-gray-50 ${getLevelColor(level)}`
										}`}
									>
										{level}
									</button>
								);
							})}
						</div>

						<div className='mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl'>
							<label className='flex items-center justify-center gap-3 cursor-pointer'>
								<input
									type='checkbox'
									checked={emergencyFlag}
									onChange={(e) =>
										setEmergencyFlag(e.target.checked)
									}
									className='w-6 h-6 text-red-600 border-red-300 rounded focus:ring-2 focus:ring-red-500'
								/>
								<span className='font-semibold text-red-700 text-lg'>
									🚨 Mark as Emergency Case
								</span>
							</label>
							<p className='text-red-600 text-sm text-center mt-2'>
								Check this if you need immediate medical attention
							</p>
						</div>

						<div className='flex gap-3 mt-6'>
							<button
								onClick={() => setStep(3)}
								className='w-1/3 py-4 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200'
							>
								Back
							</button>
							<button
								onClick={handleCheckIn}
								disabled={!canCheckIn()}
								className='w-2/3 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 shadow-lg'
							>
								{isLoading ? (
									<div className="flex items-center justify-center gap-2">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
										Processing...
									</div>
								) : (
									'✅ Check In'
								)}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
