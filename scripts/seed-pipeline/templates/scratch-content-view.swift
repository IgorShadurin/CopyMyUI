import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.96, green: 0.97, blue: 0.99), Color.white],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 16) {
                Image(systemName: "square.stack.3d.up.fill")
                    .font(.system(size: 42, weight: .semibold))
                    .foregroundStyle(.black.opacity(0.78))

                Text("CopyMyUI Scratch")
                    .font(.system(size: 26, weight: .bold, design: .rounded))

                Text("Pipeline placeholder view")
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
            }
            .padding(32)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 32, style: .continuous))
            .padding(24)
        }
    }
}
