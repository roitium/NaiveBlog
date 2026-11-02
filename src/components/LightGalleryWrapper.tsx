'use client'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lightgallery.css'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import LightGallery from 'lightgallery/react'
import type { ReactNode } from 'react'

// 提供给博文界面的 light gallery 包装
export default function LightGalleryWrapper({
	children,
}: {
	children: ReactNode
}) {
	return (
		<LightGallery
			speed={500}
			plugins={[lgThumbnail, lgZoom]}
			licenseKey={import.meta.env.PUBLIC_LIGHT_GALLERY_LICENSE_KEY}
			selector={'img'}
		>
			{children}
		</LightGallery>
	)
}
