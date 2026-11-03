import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'
import lightGallery from 'lightgallery'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
let galleries: ReturnType<typeof lightGallery>[] = []
export function initArticle() {
	galleries.forEach((gallery) => gallery.destroy())
	galleries = Array.from(
		document.querySelectorAll<HTMLElement>('[data-article-gallery]'),
	).map((element) =>
		lightGallery(element, {
			selector: 'img',
			plugins: [lgThumbnail, lgZoom],
			speed: 500,
			licenseKey: import.meta.env.PUBLIC_LIGHT_GALLERY_LICENSE_KEY,
		}),
	)
	document
		.querySelectorAll<HTMLButtonElement>('[data-copy-code]')
		.forEach((button) => {
			button.onclick = async () => {
				const pre = button.closest('[data-code-block]')?.querySelector('pre')
				const code = pre?.querySelector('code')?.textContent ?? pre?.textContent
				if (!code) return
				try {
					await navigator.clipboard.writeText(code)
					button.textContent = '已复制'
					setTimeout(() => {
						button.textContent = '复制'
					}, 2000)
				} catch {
					button.textContent = '复制失败'
				}
			}
		})
}
document.addEventListener('astro:before-swap', () => {
	galleries.forEach((gallery) => gallery.destroy())
	galleries = []
})
