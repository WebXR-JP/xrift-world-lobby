import { Container, Image } from '@react-three/uikit'

export const AvatarIcon = ({ avatarUrl }: { avatarUrl: string | null }) => {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        width={28}
        height={28}
        borderRadius={14}
        objectFit="cover"
      />
    )
  }
  return (
    <Container
      width={28}
      height={28}
      borderRadius={14}
      backgroundColor="#8b5cf6"
    />
  )
}
