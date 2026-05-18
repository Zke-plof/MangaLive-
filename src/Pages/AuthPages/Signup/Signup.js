import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../auth.module.scss';
import './singup.scss';

import Form from '../../../SharedUI/Form/Form';
import Input from '../../../SharedUI/Form/Input';
import CheckBox from '../../../SharedUI/Form/CheckBox';
import Buttons from '../../../SharedUI/Form/Buttons';
import { useNavigate } from 'react-router-dom';
import MainContainer from '../../../Layouts/MainContainer/MainContainer';
import Modal from '../../../Features/Modal/Modal';
import { useState } from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const rootModal = document.getElementById('modal-root');

const Signup = () => {
	const [shouldShow, setShouldShow] = useState(false);
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [r_email, setR_email] = useState('');
	const [password, setPassword] = useState('');
	const [r_password, setR_password] = useState('');
	const [checked, setChecked] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		setShouldShow(true);

		const timeout = setTimeout(() => setShouldShow(false), 5000);

		return () => clearTimeout(timeout);
	}, []);

	const handleSignup = () => {
		setShouldShow(true);
	};

	const handleSingin = () => {
		navigate(`/singin`);
	};

	return (
		<>
			<Helmet>
				<meta charSet="utf-8" />
				<title>Sign Up | MangaLive</title>
				<meta name="description" content="Sign up for a free MangaLive account to save your favorite manga, follow your favorite series, and track your reading progress." />
			</Helmet>
			<MainContainer mainClasses={styles.flexcenter} isHeaderBlack>
				<Form
					type={'Create Account'}
					additional={
						'Your username must be unique and will be visible to other users.'
					}
				>
					<Input
						type={'text'}
						id={'username'}
						placeholder={'Username'}
						value={username}
						setValue={setUsername}
					/>
					<Input
						type={'email'}
						id={'email'}
						placeholder={'Email'}
						value={email}
						setValue={setEmail}
					/>
					<Input
						type={'email'}
						id={'r_email'}
						placeholder={'Repeat email'}
						value={r_email}
						setValue={setR_email}
					/>
					<Input
						type={'password'}
						id={'password'}
						placeholder={'Password'}
						value={password}
						setValue={setPassword}
					/>
					<Input
						type={'password'}
						id={'r_password'}
						placeholder={'Repeat password'}
						value={r_password}
						setValue={setR_password}
					/>
					<CheckBox
						message={'Created an account already and need to activate it?'}
						additionalMess={'Click here.'}
						value={'I have read and accept the'}
						additionalButt={'Rules'}
						checked={checked}
						setChecked={setChecked}
					/>
					<Buttons>
						<button onClick={handleSignup}>Create Accaunt</button>
						<button onClick={handleSingin}>Log In Instead</button>
					</Buttons>
					<p style={{ color: '#494949' }}>
						This site is protected by reCAPTCHA and the Google Privacy Policy
						and Terms of Service apply.
					</p>
				</Form>
			</MainContainer>

			{ReactDOM.createPortal(
				<Modal active={shouldShow} setActive={setShouldShow}>
					<div style={{ padding: '8px' }}>
						<h2 style={{ color: '#ff6740', marginBottom: '12px' }}>MangaLive Registration</h2>
						<p style={{ marginTop: 15, lineHeight: '1.5', color: '#333' }}>
							To register a new account, please sign up via the original <strong>MangaDex</strong> platform, which acts as our secure authentication and data provider.
						</p>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								marginTop: 5,
							}}
						>
							<a
								style={{ color: 'red' }}
								href="https://mangadex.org/account/signup"
							>
								{'Click here :)'}
							</a>
						</div>
					</div>
				</Modal>,
				rootModal
			)}
		</>
	);
};

export default Signup;
