import { ImageResponse } from '@vercel/og'
import logo from '@/public/static/images/logo.png?inline'

const size = {
	width: 1200,
	height: 630,
}

export function generateOG({
	title,
	description = '还没有简介欸',
	date,
}: {
	title: string
	description?: string
	date: Date
}) {
	const websiteLogo = logo
	const publishedDate = date.toLocaleDateString('zh-CN', {
		timeZone: 'Asia/Shanghai',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #fff1f1)',
					padding: '60px',
				}}
				lang='zh-CN'
			>
				<div
					style={{
						margin: 'auto',
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: '80px',
						width: '100%',
						paddingLeft: '20px',
						paddingRight: '0px',
					}}
				>
					{/* Right Column with Logo */}
					<div style={{ display: 'flex', flex: '0 0 auto' }}>
						<img
							// just make typescript happy
							src={websiteLogo as unknown as string}
							alt='Logo'
							style={{
								width: '280px',
								height: '280px',
								borderRadius: '50%',
								objectFit: 'cover',
								transform: 'rotate(0deg)',
								transition: 'transform 0.7s ease-in-out',
							}}
						/>
					</div>
					{/* Left Column with Text */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '20px',
							flex: '1',
						}}
					>
						<div
							style={{
								display: 'flex',
								fontSize: 52,
								fontWeight: 700,
								color: '#1e293b',
								lineHeight: 1.2,
							}}
						>
							{title}
						</div>
						<div
							style={{
								display: 'flex',
								fontSize: 30,
								color: '#475569',
							}}
						>
							{description}
						</div>
						{publishedDate && (
							<div
								style={{
									display: 'flex',
									fontSize: 24,
									color: '#64748b',
								}}
							>
								{publishedDate}
							</div>
						)}
					</div>
				</div>
			</div>
		),
		{
			headers: { 'Cache-Control': 'public, max-age=86400' },
			...size,
		},
	)
}
